import * as postService from '../services/postService.js' ;
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import fs from 'fs'


export const createPost = async (req , res, next) => {
     
     try {
         const {text} = req.body ;
         console.log("my text inside controller is " , text) ;
         const userId = req.user._id ;
         const post = await postService.createNewPost( req , {text , userId}) ;

         return res.status(201).json({success : true , message : "post created successfully" , data : post}) ;
     } catch (error) {
         if (error.name === "ValidationError") {
         return res.status(400).json({
         success: false,
         message: error.message, // "content is longer than 500 chars or blank"
       });
    }
        next(error) ;
}
} ;

export const getAllPosts = async (req, res) => {
  try {
    // offset pagination
    // const page = parseInt(req.query.page) || 1 ;
    // const limit = parseInt(req.query.limit) || 20 ;

    // if(limit > 50 ){
    //     limit = 50 ;
    // }

    // const posts = await postService.getRecentPosts(limit , (page-1)*limit);
    
    let {cursor , limit} = req.query ;

    limit = Math.min(parseInt(limit , 10) || 20 , 50) ;

    if(cursor && !mongoose.Types.ObjectId.isValid(cursor)){
        return res.status(400).json({success : false , message : "invalid cursor"}) ;
    }

    const {posts , nextCursor} = await postService.getRecentPosts({
       cursor , 
       limit : parseInt(limit , 10),
    })
     
   
    const userIds = [...new Set(posts.map(p => p.userId.toString()))];

    const users = await User.find({ _id: { $in: userIds } })
                            .select("_id username profilePic")
                            .lean();

    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

    // Construct DTO response
    const response = posts.map(p => ({
      ...p,
      user: userMap[p.userId.toString()] || null,
    }));

    return res.json({ success: true, data: response , nextCursor });
  } catch (error) {
    console.error("getPosts error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await postService.getPostWithComments(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    // Resolve user separately
    const user = await User.findById(post.userId).select("_id username profilePic ").lean();

    // Fetch comments (could later move to CommentService)
    // const comments = await Comment.find({ postId }).sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      data: {
        ...post,
        user: user || null,
        // comments,
      },
    });
  } catch (error) {
    console.error("getPostWithComments error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const deletePost = async (req , res) => {
    try {
        const {postId} = req.params ;
    
      const post = postService.findPostById(postId) ;
      if(!post){
        return res.status(400).json({success : false , message : "the post does not exists"}) ;
      }
      
      if(post.userId.toString() !== req.user._id.toString()){
         return res.status(400).json({success : false , message : "you are not allowed to delete this post"}) ;
      }
      

      const response = await postService.deletePostById(postId) ;

      return res.json({ success: true, message : "post deleted successfully"}) ;
    } catch (error) {
        console.log("error in deletepost by id in controller " , error.message) ;
        res.status(500).json({success : false , message : "server error"}) ;
    }

}