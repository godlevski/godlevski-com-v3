import React, {useState, useEffect, useRef}  from "react";
import settings from "./settings";
import axios from "axios";
import StatusModal from "../../components/StatusModal/StatusModal";
import SlideItem from "./View/SlideItem.jsx";
import styles from "./View/styles.module.css";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input/Input";
import {auth} from "./Auth";
export default ({
}) => {
  const navigate = useNavigate();
  if(!auth.status){
    return navigate('/admin/')
  }
  const [message, setMessage] = useState();
  const [data, setData] = useState([]);

  async function fetchData(){
    const path = settings.serverBasePath+settings.slidesPath;
    
    try {
      const res = await axios.get(path);
      setData(res.data.data);
    }
    catch (error){
      setMessage('error loading slides');
      console.error('error loading slides:', error);
    }
  }

  async function deleteSlide(id){
    if(!id) return;
    try {
      const slidePath = settings.serverBasePath+settings.slidePath+'/'+id
      const res = await axios.delete(slidePath);
      setMessage("slide"+id+"deleted");
    }
    catch {
      setMessage("error deleting slide");
    }
  }

  async function duplicateSlide(id){
    console.log('duplicate logic goes here')
  }
  
  useEffect(fetchData,[]);
  console.log('data is', data);
  return <div className={styles.slidesList}>
  {data.map(slide =>
    <SlideItem key={slide._id} {...slide} >
      <Input type="button" name="open" onClick={() => navigate('/admin/slides/'+slide._id)} value="edit" />
      <Input type="button" name="duplicate" onClick={() => navigate('/admin/slides/new/'+slide._id)} value="duplicate" />
      <Input type="button" name="x" onClick={() => { if(window.confirm('Are you sure?')){deleteSlide(slide._id)}}} value="delete!" />
    </SlideItem>
  )}
    <button className={styles.button} onClick={ () => navigate('/admin/slides/new') }>add slide</button>
  </div>
}