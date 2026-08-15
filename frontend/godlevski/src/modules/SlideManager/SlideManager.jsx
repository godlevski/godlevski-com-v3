import React, {useState, useEffect, useRef} from "react";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import StatusModal from "../../components/StatusModal/StatusModal";
import Input from "../../components/Input/Input.jsx";
import SlideEditor from "./SlideEditor";
import styles from "./View/styles.module.css";
import settings from "./settings";
import {auth} from "./Auth";
const sampleData = {
    project: "Test Project",
    client: "Test Client",
    date: "2022-01-11",
    image: "katiailina-trees_project_o-837f2a6e96eb011f93d87b9851d57903.jpg?123234",
    tags: [
        {
            "_id": "61eb2f54c697ddfdd4d25ff8",
            "tagname": "bus card",
            "sxp": 30,
            "syp": 0,
            "exp": 80,
            "eyp": 90,
            "__v": 0,
            "_slide_id": "61eb216826b30f1bd29e4f28"
        },
        {
            "_id": "61eb4b0a40984d31aadbc7b9",
            "_slide_id": "61eb216826b30f1bd29e4f28",
            "tagname": "logotypes",
            "sxp": 1,
            "syp": 0,
            "exp": 80,
            "eyp": 100,
            "__v": 0
        }
      ]
  }
const baseData = {
    project: "",
    client: "",
    date: "",
    image: "",
    tags: []
  };

export default ({
  slideId:inputSlideId=""
}) => {
  const navigate = useNavigate();
  if(!auth.status){
    navigate('/admin/');
  }
  const params = useParams();
  const slideId = inputSlideId||params.slideId;
  const copyFrom = params.copyFrom;
  const slideBasePath = settings.serverBasePath+settings.slidePath+'/'
  const slidePath = slideId ? slideBasePath+slideId : copyFrom ? slideBasePath+copyFrom : null;
  
  const form = {};
  const formEl = useRef();
  const message = useRef();
  const [data, setData] = useState(baseData);
  const [messageState, setMessageState] = useState(new Date()); //delibarate state to update messages component
  const clearEditor = useRef(()=>{}); // set to true before state update to clear current areas state
  async function fetchData(){
    if(!slidePath) return;
    try {
      const response = await axios.get(slidePath);
      console.log('response', response);
      if(response.status > 200) throw Error('no slide found');
      message.current = "slide loaded";
      setData(response.data.data);
    }
    catch (err){
      console.error('error fetching slide', slideId);
      // this is where I push state to the new slide
      navigate('/admin/slides/new')
    }
  }
  const imageLink = data.image ? settings.imageBasePath+data.image : '';
  async function saveForm(){
    if(!formEl.current) return console.error('no form found');
    try {
      const formData = new FormData(formEl.current);
      if(slideId && slideId !== 'new'){
        const res = await axios.patch(slidePath, formData);
      }
      else {
        const res = await axios.post(slideBasePath, formData);
        
        console.log('response is', res);
        //forward my current page here or push state
        navigate('/admin/slides/'+res.data.data._id)
      }
      message.current = "slide saved";
      setMessageState(new Date());
    }
    catch {
      message.current = "error saving slide";
      setMessageState(new Date());
    }
  }
  async function deleteForm(){
    if(!formEl.current) return console.error('no form found');
    if(!slideId) return console.error('no slide to delete');
    try {
      const res = await axios.delete(slidePath);
      message.current = "slide deleted";
      // this is where I push state to match new slide
      clearEditor.current() // = new Date(); // clears areas
      setData({});
      setData(baseData); // we pass new base data object, for case scenario where we deleted without fetching, so that state is defferent and it triggers the update
      navigate('/admin/slides/new');
    }
    catch {
      message.current = "error deleting slide";
      setMessageState(new Date());
    }  
  }
  useEffect( fetchData, [] );
  useEffect(function(){
    console.log('clearEditorA', clearEditor, form)
  },[])
  
  return <>
    
    <StatusModal 
      message={message.current}
      timestamp={messageState}
      />
    <SlideEditor
      clearEditor={clearEditor}
      reference={formEl} 
      project={data.project}
      client={data.client}
      date={data.date}
      tools={data.tools}
      image={imageLink}
      form={form}
      tags={data.tags||[]}>
      <Input
        name="save"
        placeholder="save"
        onClick={saveForm}
        className={styles.buttons}
        type="button" />
      
      { slideId 
        ? 
        <Input
          name="delete"
          placeholder="delete"
          onClick={deleteForm}
          className={styles.buttonRed+ ' '+styles.buttons}
          type="button" />
        : null
      }
      
    </SlideEditor>
    
  </>;
};