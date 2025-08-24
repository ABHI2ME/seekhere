import express from 'express' ;
import protectRoute from '../middleware/auth.middleware.js';
import { createPost, deletePost, getAllPosts, getPostById } from '../controller/post.controller.js';
import createUpload from '../middleware/multer.middleware.js';

const router = express.Router() ;

const postUpload = createUpload({
  folder: "../public/uploads/posts",
  allowedTypes: ["jpeg", "jpg", "png", "webp","gif"],
  MIMETypes : ["image/jpeg", "image/png", "image/gif", "image/webp"],
  maxSize: 5 * 1024 * 1024,
});

router.post('/' , protectRoute , postUpload.single("image") , createPost) ;
//frontend url will look like GET /api/posts?page=1&limit=20
router.get('/' , getAllPosts) ;
router.get('/:id' , getPostById) ;
router.delete('/:id', protectRoute , deletePost) ;


export default router ;

