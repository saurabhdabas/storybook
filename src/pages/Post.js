import { React,useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Grid, Box, Typography, Avatar, Chip, Skeleton, Paper, Stack, Badge, TextField, Button} from  '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import HomeIcon from '@mui/icons-material/Home';
import Navbar from '../components/Navbar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import AddCommentIcon from '@mui/icons-material/AddComment';
import totalWords from '../helpers/Words';

import { db } from '../firebase-config';
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { storage } from "../firebase-config";
import {
  ref,
  getDownloadURL,
  list
} from "firebase/storage";



const Post = () => {

  const imagesListRef = ref(storage, "images/");
  const msg = new SpeechSynthesisUtterance();

  const [ imageURL, setImageURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [readTime, setReadTime] = useState(0);
  const [volume, setVolume] = useState("Off");
  const [disablelike, setDisablelike] = useState(false);
  const [disableUnlike, setDisableUnlike] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  const [comment, setComment] = useState({data:"",name:"",img:""});
  const [clicked, setClicked] = useState(false);
  const [comments, setComments] = useState([]);
  const { id } = useParams();
  
  const [post, setPost] = useState({
    title:"",
    publishDate:"",
    content:"",
    img:"",
    likes:0,
    dislikes:0,
    comments:[],
    author:{email:"",id:"",image:"",name:""}
    });
  
    useEffect(()=>{
      list(imagesListRef).then((response) => {
        response.items.forEach((item)=>{
          getDownloadURL(item).then((url)=>{
            let slicedImg = post.img.slice(27);
            let slicedUrl = url.slice(78,114)
            if(slicedImg === slicedUrl){
              setImageURL(url);
            }
          })
        })
      });
    },[post])
    
    useEffect(()=>{
      
      getDoc(doc(db, "posts", id))
      .then((response)=>{
        console.log("data:",response.data());
        setPost((prevValue)=>({
          ...prevValue,
          title:response.data().title,
          publishDate:response.data().publishDate,
          content:response.data().content,
          img:response.data().imageSrc,
          likes:response.data().likes,
          dislikes:response.data().dislikes,
          comments:response.data().comments,
          author:{
            email:response.data().author.email,
            id:response.data().author.id,
            image:response.data().author.img,
            name:response.data().author.name,
          }
          })
        )
      })
      setTimeout(()=>{
        setIsLoading(true)
      },3300)
  
    },[likes,dislikes,comments])

  // Handle user's Input for posts's Comment
  const handleComment = (event) => {
    setComment({data:event.target.value,name:post.author.name, img:post.author.image});
  };
  
  const submitHandler = () => {
    if(comment){
      setClicked(true);
      setComments([comment]);
    }
  }
  useEffect(() =>{
    if(clicked){
      setClicked(false);
      updateDoc(doc(db,"posts",id),{comments:[...post.comments,...comments]});
    }
    setComment({data:"", name:"",img:""});
  },[id,clicked,comments]);

    console.log("comments:",comments);

    // useEffect(()=>{
    //   updateDoc(doc(db,"posts",id),{comments:[...comments]});

    // },[id,comments])
    // Handle Likes
    const handleLiked = () => {
      setDisablelike(true);
      setLiked(true);
      setLikes((likes)=>likes+1);
    }
    useEffect(()=>{
      if(liked){
        setLiked(false);
        if(!post.likes){
          updateDoc(doc(db,"posts",id),{
            likes:likes,
          })
        } else {
          updateDoc(doc(db,"posts",id),{
            likes:post.likes + likes,
          })
        }
      }
    },[id,liked,likes])

  // Handle Dislikes
  const handleDisliked = () => {
    setDisableUnlike(true);
    setDisliked(true)
    setDislikes((dislikes)=>dislikes+1);
  }
  useEffect(()=>{
    if(disliked){
      setDisliked(false);
      if(!post.dislikes){
        updateDoc(doc(db,"posts",id),{
          dislikes:dislikes,
        })
      } else {
        updateDoc(doc(db,"posts",id),{
          dislikes:post.dislikes + dislikes,
        })
      }
    }
  },[id,disliked,dislikes])

  useEffect(()=>{
    // Calculating total Read time
    const count = totalWords(post.content);
    setReadTime(`${(count/275).toFixed(2)}`);
  },[post])

  // Handle Speech 
  const handleVolume = () => {
    if(volume === "ON"){
      window.speechSynthesis.cancel();
      setVolume("OFF")
    } else {
      setVolume("ON")

      window.speechSynthesis.speak(msg)
    }
  }

  useEffect(() => {
    msg.text = post.content
    msg.rate = 0.70
    msg.voice = window.speechSynthesis.getVoices().filter(function(voice) { return voice.name === 'Samantha'})[0];
  }, [msg])
  
  // Retrieving user Info from local Storage
  const user = JSON.parse(localStorage.getItem('user'));

  // Delete the post when clicked
  const handlePostDelete = (event) => {
    event.preventDefault();
    deleteDoc(doc(db, "posts", id)).then(()=>{
      navigate('/home')
    })
  }

  // Handle Navigation
  let navigate = useNavigate();
  const handleNavigation = () => {
    navigate(-1);
  }

  return (
    <Grid sx={{backgroundColor:"#F6F6F6", minHeight:"100vh", backgroundImage:"url('/background.jpeg')", backgroundRepeat:'no-repeat', backgroundSize:'cover' }}>
      <Navbar/>
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        <Paper elevation={3} sx={{width:'70%', marginTop:15, marginBottom:5, backgroundColor:"#FFFFFF"}}>
        <Box
          component="form"
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding={3}
          justifyContent="space-around"
          borderRadius={5}
          marginTop={3}
          marginBottom={3}
        >
          <Grid display='flex' alignItems='center' justifyContent='space-between' sx={{width:"100%"}}>
          {isLoading ? 
              <Grid sx={{width:"9%"}}container display='flex' direction="row" alignItems='center'>
              <Tooltip title="Home" placement="left" >
                <IconButton aria-label="Home"  sx={{color:"#1976d2"}} onClick={handleNavigation}>
                <HomeIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="h6" noWrap component="div" fontSize={14}   fontFamily="'Snowburst One', cursive" fontWeight={700}>
                Home
              </Typography>
            </Grid>
              : <Grid marginLeft={1.2}>
                <Skeleton animation="wave" variant="circular" width={25} height={25} />
                </Grid>}
          <Typography variant="h6" noWrap component="div" fontSize={26}   fontFamily="'Snowburst One', cursive" textAlign='center'sx={{ textTransform: 'uppercase', width:'50%'}}>
            {isLoading ? post.title :           
            <Skeleton
            animation="wave"
            height={30}
          />}
          </Typography>

          {post.author.email === user.email ? isLoading ? <Tooltip title="Delete" placement="right">
          <IconButton aria-label="delete"  onClick ={handlePostDelete} sx={{color:"#DC3545"}}>
            <DeleteIcon/>
          </IconButton>
          </Tooltip>: <Skeleton animation="wave" variant="circular" width={25} height={25} />
           : 
            <div style={{width:25 ,height:25}}></div>
          }
          </Grid>
          <Grid display='flex' alignItems='center' justifyContent='space-between' sx={{width:"99.5%", marginTop:5, marginBottom:5}}>

            <Grid>
              { isLoading ? 
              <Grid container display='flex' direction="row" alignItems='center'>
                <Tooltip title="Publish Date" placement="left" >
                  <IconButton aria-label="Calendar"  sx={{color:"#1976d2"}}>
                    <CalendarTodayIcon/>
                  </IconButton>
                </Tooltip>
                <Typography variant="h6" noWrap component="div" fontSize={14}   fontFamily="'Snowburst One', cursive" fontWeight={700}>
                  {post.publishDate}
                </Typography>
              </Grid> :
              <Grid container display='flex' direction="row" alignItems='center' justifyContent='space-between' sx={{width:"99.5%",marginLeft:0.8}}>
                <Skeleton sx={{marginRight:1}} animation="wave" variant="circular" width={25} height={25} />
                <Skeleton
                animation="wave"
                height={20}
                width="100px"
                />
              </Grid>             
              }
            </Grid>
            <Chip
              avatar={isLoading ? <Avatar alt={post.author.name} src={post.author.image}/> : <Skeleton animation="wave" variant="circular" width={20} height={20} />}
              label=
              {              
                <Typography variant="h6" noWrap component="div" fontSize={16} fontFamily="'Raleway', sans-serif" >
              { isLoading ? post.author.name :             
              <Skeleton
              animation="wave"
              height={20}
              width="70px"
              />
              }
                </Typography>
              }
              variant="outlined" 
            />
          </Grid>
          <Grid sx={{marginBottom:5,marginTop:5}}>
          {isLoading ? <img src={imageURL} alt="story" style={{borderRadius:'15px',boxShadow: "rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px"}}width='700' height='200'/> : <Skeleton animation="wave" variant="rectangular" width={700} height={200}/>}
          </Grid>
          {isLoading ?
          <Grid container direction='row' alignItems='center' justifyContent='space-between' sx={{width:"99.5%", marginBottom:5, marginTop:5}}>
            <Grid  container  display='flex' alignItems='center' justifyContent='start'>
                <Tooltip title="Read Time" placement="left">
                  <AccessTimeIcon sx={{marginRight:1, marginLeft:1,color:"#1976d2"}}/>
                </Tooltip>
                <Typography variant="h6" noWrap component="span" fontSize={14}   fontFamily="'Snowburst One', cursive" fontWeight={700} textAlign='start' sx={{marginRight:1}}>
                  Read time:
                </Typography>
            <Typography variant="h6" noWrap component="span" fontSize={16} fontFamily="'Roboto', sans-serif" textAlign='start'>{readTime}</Typography>
            <Typography variant="h6" noWrap component="span" fontSize={14}   fontFamily="'Snowburst One', cursive" fontWeight={700} textAlign='start' sx={{marginLeft:1}}>minutes</Typography>
            <Grid  container  display='flex' alignItems='center' justifyContent='start' sx={{marginTop:1}}>
              <Tooltip title="Play" placement="left" >
                <IconButton aria-label="Speak"  sx={{color:"#1976d2"}} onClick={handleVolume}>
                  {volume === "ON" ?  <VolumeUpIcon sx={{color:"#1976d2"}}  cursor='pointer'/>   : <VolumeOffIcon sx={{color:"#1976d2"}} cursor='pointer'/> }
                </IconButton>
              </Tooltip>
              <Typography variant="h6" noWrap component="span" fontSize={14}   fontFamily="'Snowburst One', cursive" fontWeight={700} textAlign='start' sx={{marginRight:1}}>
                Sound: {volume}
              </Typography>
            </Grid>
            </Grid> 
          </Grid>:
          <Grid container display='flex' direction="column" alignItems='center' justifyContent='start' sx={{width:"99.5%",marginLeft:0.8, marginBottom:5, marginTop:5}}>
            <Grid  container  display='flex' alignItems='center' justifyContent='start'>
              <Skeleton sx={{marginRight:1}} animation="wave" variant="circular" width={25} height={25} />
              <Skeleton
              animation="wave"
              height={20}
              width="200px"
              />
            </Grid>
            <Grid  container  display='flex' alignItems='center' justifyContent='start' sx={{marginTop:1}}>
              <Skeleton sx={{marginRight:1}} animation="wave" variant="circular" width={25} height={25} />
              <Skeleton
                animation="wave"
                height={20}
                width="100px"
              />
            </Grid>
          </Grid> 
          }
          <Grid
            component="div"
            fontSize={16} 
            fontFamily="'Raleway', sans-serif"
          >
            <Typography variant="h6" wrap="true" component="div" fontSize={16} fontFamily="'Snowburst One', cursive" textAlign='justify' paddingLeft={1.5} paddingRight={1.5} lineHeight='3' fontWeight={900} >
              {isLoading ? post.content :             
              <Skeleton
              animation="wave"
              height={300}
              width='1050px'
            />}
            </Typography>
        
          </Grid>
        
          <Stack direction="row" display='flex' justifyContent='space-between' sx={{width:'100%',marginTop:5}}>
          {isLoading ? 
          <>
            <Tooltip title="Like" placement="right">
              <IconButton disabled={disablelike} aria-label="Like" onClick ={handleLiked} sx={{color:"#DC3545"}}>
              <Badge badgeContent={post.likes ? post.likes : likes} color="error">
                <FavoriteBorderIcon cursor="pointer" sx={{width:30, height:30}}/>
              </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Dislike" placement="right">
              <IconButton disabled={disableUnlike} aria-label="Dislike" sx={{color:"#DC3545"}} onClick ={handleDisliked} >
              <Badge badgeContent={post.dislikes ? post.dislikes : dislikes} color="error">
                <HeartBrokenIcon  cursor="pointer" sx={{width:30, height:30}}/>
              </Badge>
              </IconButton>
            </Tooltip>
          </> 
          : <>
          <Skeleton sx={{marginRight:1}} animation="wave" variant="circular" width={25} height={25} />
          <Skeleton sx={{marginRight:1}} animation="wave" variant="circular" width={25} height={25} />
          </>
        } 
          </Stack>
          <Grid  container  display='flex' alignItems='center' justifyContent='center' sx={{marginTop:1}}>
          <Box sx={{backgroundImage:"url('/new.jpeg')", backgroundRepeat:'no-repeat', backgroundSize:'1000px 300px',position:'relative',top:"5px",width:"1020px",height:"180px"}}></Box>
          <TextField
            id="outlined-name"
            label=
            {
            <Typography fontSize={20} fontFamily="'Snowburst One', cursive">
              Comment
            </Typography>
            }
            inputProps={{
              maxLength: 50,
            }}
            value={comment.data}
            onChange={handleComment}
            sx={{width:800, marginBottom:5}}
          />
          <Button
            direction='row'
            sx={{ m: 1, width: 800 }}
            variant="contained"
            onClick={submitHandler}>
            <AddCommentIcon/>
            <Typography marginLeft={5} fontSize={18} fontFamily="'Snowburst One', cursive" fontWeight={700}>
              POST COMMENT
            </Typography>
          </Button>
          </Grid>
          
        </Box>
        </Paper>
        <Paper elevation={3} sx={{width:'70%', marginTop:5, marginBottom:5, backgroundColor:"#FFFFFF"}}>
        {post.comments.map((comment)=>{
            return (<Typography fontSize={20} fontFamily="'Snowburst One', cursive">{comment.data}</Typography>)
          })}
        </Paper>
      </Grid>
    </Grid>
  );

}

export default Post;
