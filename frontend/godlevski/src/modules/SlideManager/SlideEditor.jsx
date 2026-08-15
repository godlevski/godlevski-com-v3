import React, {useState, useEffect, useRef} from "react";
import Area from "./View/Area";
import Image from "./View/Image";
import ProjectData from "./View/ProjectData";
import AreasDrawContainer from "./AreasDrawContainer";
import Input, {InputG} from "../../components/Input/Input";
import {toBase64} from "../../utils/files.js";
import UID from "../../utils/UID";
import {makeEvent} from "../../utils/domHelpers.js"
import styles from "./View/styles.module.css";
import {getNewArea} from "./AreasDrawContainer";
const newDrawArea = getNewArea;
const newArea = function(drawArea=newDrawArea()){
  return {
      id: drawArea.id,
      _id: null,     // mongo based id for an element
      tagname: '',   // mongo area tagname
      preview: newPreview(),   // preview object 
      drawArea: drawArea
    }
}
const newPreview = function(obj={}){
  return {sxp: obj.sxp||null, syp: obj.syp||null, exp: obj.exp||null, eyp: obj.eyp||null}
}
export const allowedExtentions = /\.(jpeg|jpg|png)$/gi;
export default ({
  clearEditor={current:()=>{}},
  reference, // doc ref
  project:inputProject="",
  client:inputClient="",
  date:inputDate="",
  image:inputImage="",
  tools:inputTools="",
  tags=[],
  form:inputForm={},
  children
}) => {
  const newRef = useRef();
  const formEl = reference||newRef;
  const form = inputForm;
  const [image, setImage] = useState(inputImage);
  const drawContainerEl = useRef();
  const imageEl = useRef();
  const areas = useRef({});
  const drawAreas = useRef([]);
  const [areasState, setAreasState] = useState(new Date());
  async function handleOnChange(event){
    const {target} = event;
    
    if(!target.files[0] || !(target.files[0].name+'').match(allowedExtentions) ) return setImage(null);
    
    const image = await toBase64(target.files[0]);
    //console.log('image file is', image);
    setImage(image);
  }
  //console.log('form is', form);

  function handleNewDrawArea(drawArea, drawAreas){
    //console.log('handleNewDrawArea', drawArea)
    const id = drawArea.id;
    areas.current[id] = newArea(drawArea)
    setAreasState(new Date());
  }

  function getPreviewBox(drawArea){
    if(!imageEl.current) return;
    const imageBBox = imageEl.current.getBoundingClientRect();
    const drawContainerBBox = drawContainerEl.current.getBoundingClientRect();
    const offsetLeft = imageBBox.left - drawContainerBBox.left;
    const offsetTop = imageBBox.top - drawContainerBBox.top;
    
    const imgWidth = imageBBox.width;
    const imgHeight = imageBBox.height;
    // start and end x and y in precentage relative to the image
    // (x-or-y position on the image)/(image width-or-height) * 100 %
    const sxp = (drawArea.left - offsetLeft)/imgWidth * 100; // precentage based start and end values
    const syp = (drawArea.top - offsetTop)/imgHeight * 100; // precentage based start and end values
    const exp = (drawArea.left - offsetLeft + drawArea.width)/imgWidth * 100; // precentage based start and end values
    const eyp = (drawArea.top - offsetTop + drawArea.height)/imgHeight * 100; // precentage based start and end values
    //console.log('sxp, syp, exp, eyp', sxp, syp, exp, eyp);  
    return {sxp, syp, exp, eyp}
  }

  function getDrawAreaFromPreviewForCurrentImage( preview=newPreview() ){
    if(!imageEl.current) return newDrawArea();
    const imageBBox = imageEl.current.getBoundingClientRect();
    const drawContainerBBox = drawContainerEl.current.getBoundingClientRect();
    const offsetLeft = imageBBox.left - drawContainerBBox.left;
    const offsetTop = imageBBox.top - drawContainerBBox.top;
    const imgWidth = imageBBox.width;
    const imgHeight = imageBBox.height;
    return {
      left: offsetLeft + (imgWidth*preview.sxp)/100,
      top: offsetTop + (imgHeight*preview.syp)/100,
      width: (preview.exp-preview.sxp)/100*imgWidth,
      height: (preview.eyp-preview.syp)/100*imgHeight
    }
  }
  // adjust areas to be square based on longest side

  function squareUpAreasByLongest(){
    Object.values(areas.current).forEach( area => {
      const {drawArea} = area;
      if(drawArea.width > drawArea.height){
        drawArea.height = drawArea.width;
      }
      else if(drawArea.height > drawArea.width) {
        drawArea.width = drawArea.height;
      }
      area.preview = getPreviewBox(drawArea)
    })
    setAreasState(new Date());
  }

  function squareUpAreasByShortest(){
    Object.values(areas.current).forEach( area => {
      const {drawArea} = area;
      if(drawArea.width < drawArea.height){
        drawArea.height = drawArea.width;
      }
      else if(drawArea.height < drawArea.width) {
        drawArea.width = drawArea.height;
      }
      area.preview = getPreviewBox(drawArea)
    })
    setAreasState(new Date());
  }

  function handleDrawAreaChanged(drawArea, drawAreas){
    if(!imageEl.current) return;
    const area = areas.current[drawArea.id];
    if(!area) return; // return if blank event
    area.preview = getPreviewBox(drawArea)
    setAreasState(new Date());
  }

  function onImageChange(){
    // update are objects that where fecched from database to readjust for current image
    Object.values(fetchedAreas.current).forEach(area => {
      const newDrawArea = getDrawAreaFromPreviewForCurrentImage(area.tag);
      console.log('fetched areas', area, newDrawArea);
      Object.entries(newDrawArea).forEach(([name, value]) => {
        area.drawArea[name] = value
      })
    });
    // update all area objects
    Object.values(areas.current).forEach( (area) => {
      area.preview = getPreviewBox(area.drawArea)
    })
    setAreasState(new Date());
  }

  function removeAreaById(id){
    const i = (drawAreas.current).findIndex(a => a.id==id);
    drawAreas.current.splice(i,1);
    delete areas.current[id];
    setAreasState(new Date());
  }
  // clears refferences for current state

  function whipeCurrents(){
    areas.current = {};
    drawAreas.current.splice(0, drawAreas.current.length);
    const change = makeEvent('change', true, false);
    Object.values(form).forEach(({current:el}) => {
      el.value = null;
      el.dispatchEvent(change);
    });
    //console.log('whiped', [...drawAreas.current], {...areas.current})
    setAreasState(new Date());
  }
  //useEffect(onImageChange, [image]);
  // useEffect(function prefillData(){
  //   //console.log('form is', form);
  //   // inputProject,
  //   // inputCompany,
  //   // inputDate,
  //   form.client.current.value = inputClient;
  //   form.project.current.value = inputProject;
  //   form.date.current.value = inputDate;
  // },
  // [
  //   inputProject,
  //   inputClient,
  //   inputDate
  // ]);
  const fetchedAreas = useRef([]);
  useEffect(function populatePassedAreas(){
    tags.forEach( tag => {
      /*
        "_id": "61eb2f54c697ddfdd4d25ff8",
        "tagname": "bus card",
        "sxp": 30,
        "syp": 0,
        "exp": 80,
        "eyp": 90,
      */
      const drawArea = newDrawArea(
        getDrawAreaFromPreviewForCurrentImage(tag)
      );
      const area = newArea( drawArea );
      area.preview = newPreview(tag)
      area._id = tag._id;
      area.tagname = tag.tagname;
      areas.current[area.id] = area;
      area.tag = {...tag};
      drawAreas.current.push(drawArea);
      fetchedAreas.current.push(area);
    });
    //console.log('areas are, fetched areas are', areas, fetchedAreas);
    setAreasState(new Date());
  }, [tags])
  useEffect(function updateImageByInput(){
    setImage(inputImage);
  },[inputImage])
  // hook up call back
  useEffect(function clearStateOnRequest(){
    clearEditor.current = whipeCurrents;
    console.log('clear currents hooked', clearEditor)
  }, [])
  console.log('state run for slides', form);
  return (<>
    <form className={styles.managerBody} ref={formEl}>
      
      <div className={styles.imageContainer}>
        <AreasDrawContainer
          reference={drawContainerEl}
          onNewArea={handleNewDrawArea}
          onAreaChanged={handleDrawAreaChanged}
          areas={drawAreas}
          constraints={{
            preserveAspectRatio: true
          }}>
        
          <Image
            onLoad={onImageChange}
            reference={imageEl}
            image={image} />
        </AreasDrawContainer> 
      </div>
      
      <aside>
        <InputG
          name="image"
          type="filedrop"
          areaPlaceholder="Drop Files Here"
          onChange={handleOnChange}
          form={form}
          multiple={false}
          className={styles.dropContainer+" sd"} />
          
        <ProjectData
          inputProject={inputProject}
          inputClient={inputClient}
          inputDate={inputDate}
          inputTools={inputTools}
          form={form} />

        <div className={styles.buttonsContainer}>
          <Input 
            name="Sq Up by Longest"
            placeholder="Sq Up by Longest"
            type="button"
            onClick={squareUpAreasByLongest} />
          <Input 
            name="Sq Up by Shortest"
            placeholder="Sq Up by Shortest"
            type="button"
            onClick={squareUpAreasByShortest} />
          {children}
        </div>
        <div className={styles.areasContainer}>
           {Object.values(areas.current).map( (area,i) => (
              <Area
                key={area.id}
                i={i}
                form={area}
                imageSrc={image}
                _id={area._id}
                tagname={area.tagname}
                preview={area.preview}>
              <button 
                className={styles.button+' '+styles.red}
                onClick={(e) => {
                  e.preventDefault(); 
                  removeAreaById(area.id)
                }}>x</button>
              </Area>
           ))}
        </div>
         
      </aside>
    </form>
  </>);
}
