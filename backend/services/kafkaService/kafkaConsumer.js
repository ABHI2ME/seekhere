    import {kafka} from "../../libs/kafka.js";
    import redisClient from "../../libs/redisDocker.js";
    import prisma from "../../libs/prisma.js";

    const kafkaConsumerRun = async () =>{
        const consumer = kafka.consumer({
            groupId:"kafka-consumers" ,
            sessionTimeout: 30000,       // default ~30s
            heartbeatInterval: 3000,     // default ~3s
            rebalanceTimeout: 60000 
        });
        await consumer.connect();
        console.log("consumer connected") ;
        await consumer.subscribe({topic: "postLike" ,fromBeginning : true}) ;

        await consumer.run({
            eachBatch : async ({batch, resolveOffset, heartbeat, commitOffsetsIfNecessary }) => {
                const updates = [] ;

                 try {

                    for(const message of batch.messages){
                    const evt = JSON.parse(message.value.toString()) ;
                    updates.push(evt) ;
                    resolveOffset(message.offset) ;
                    await heartbeat() ; 
                }

                console.log("my updates is ", updates) ;


                const post_user_Id_pair = updates.map((evt) => ({
                     postId : evt.postId , 
                     userId : evt.userId ,
                })) ;

                const likedEvents = await prisma.PostLikes.findMany({
                     where : { OR : post_user_Id_pair} 
                }) ;

                const likedEventsMap = new Map(
                    likedEvents.map((evt) => ([`${evt.postId}_${evt.userId}` , evt.liked]))
                ) ;

                const postCountChange = new Map() ;
                for(const evt of updates){
                    const key = `${evt.postId}_${evt.userId}` ; 
                    const desiredState = evt.action === 'LIKE' ;
                    const recordExists = likedEventsMap.has(key) ;
                    const currentState = recordExists ? likedEventsMap.get(key) : null ;
                    let change = 0 ;

                    if(!recordExists){
                         if(desiredState === true){
                             change = 1 ;
                         }
                    }
                    else{
                          if(desiredState !== currentState){
                             change = desiredState  ? 1 : -1 ;
                          }

                    }

                    if(change !== 0){
                         const currentChange = postCountChange.get(evt.postId) || 0 ;
                         postCountChange.set(evt.postId , currentChange + change) ;
                    } 

                    likedEventsMap.set(key , desiredState) ;

                } ;

                console.log("my postCountChange is " , postCountChange) ;

                await prisma.$transaction(
                     updates.map((evt) => {
                        return prisma.PostLikes.upsert({
                             where : {postId_userId : {postId :evt.postId , userId : evt.userId}} , 
                             create : {postId : evt.postId , userId : evt.userId , liked : evt.action === 'LIKE'}  ,
                             update : {liked : evt.action === 'LIKE'} ,
                          })
                     })
                ) ;

                const postIdToUpdate = Array.from(postCountChange.keys()) ;
                console.log("my postIdToUpdate  " , postIdToUpdate) ;
                if(postIdToUpdate.length){
                     await prisma.PostLikesCount.createMany({
                         data : postIdToUpdate.map((id) => ({ postId : id}) ) ,
                         skipDuplicates : true 
                     }) 
                }

                await prisma.$transaction(
                    Array.from(postCountChange.entries()).map(([id , increment]) => 
                        prisma.PostLikesCount.update({
                             where : {postId : id } ,
                            data : {
                                  count : {
                                  increment : increment
                             } ,
                            }
                        })
                    )
                ) ;

                const pipeline = redisClient.pipeline() ;
                    for(const postId of postIdToUpdate){
                        const key = `post:${postId}:likes` ;
                        const change = postCountChange.get(postId) ;
                        if(change > 0){
                            pipeline.incrby(key , change) ;
                        }
                        else{
                            pipeline.decrby(key , Math.abs(change)) ;
                        }
                        pipeline.expire(key, 604800); // for the 7 days :) 
                    }
                    await pipeline.exec() ;

                
                await commitOffsetsIfNecessary();

                 } catch (error) {
                     console.log('the error in kafka consumer ' , error) ;
                     throw error ;
                 }
               
                
            }
        }) ;

    }

    export default kafkaConsumerRun ;



// to avoid the race conditions to create the records in postLikesCount if more consumers and batch are there
// is to use the two-way method first create the records if not exists in PostLikesCount with code 
//   await prisma.postLikesCount.createMany({
//       data: postIdsInBatch.map(id => ({ postId: id })),
//       skipDuplicates: true,
//     });

// then use the update : prisma.postLikesCount.update({
                    //   where: { postId: postId },
                    //   data: {
                    //     count: {
                    //       increment: netChange, // Use Prisma's atomic increment
                    //     },
                    //   }
// instead of using the upsert which update correctly atomic(increment in count) way but not the create part which uses the 
// value from nodejs memory(updates array of events) from events to create counter with 0 but should be using the increment in count .
// may be the value is already created from another batch with other consumers but we are using the create with count = 0 not right :); 

