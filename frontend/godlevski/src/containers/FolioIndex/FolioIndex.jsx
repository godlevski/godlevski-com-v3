import React, {useState, useEffect, useRef} from "react";
import FolioIndex from "../../components/FolioIndex/FolioIndex.jsx";
import onresize from "../../utils/windowResize";
import axios from "axios";
import Loading from "../../components/Loading/Loading";
import settings from "../../backend.settings.js";
import {useHot} from "../../classes/Knot/Knot";
import UID from "../../utils/UID";

import {
  messageKnot, 
  slidesKnot, 
  tagsIndexKnot
} from "../../controllers/Knots";

export default ({children}) => {
  const [slides, setSlides] = useHot(slidesKnot);
  const [tagsIndex, setTagsIndex] = useHot(tagsIndexKnot);
  const [transpiledData, setTranspiledData] = useState({})
  
  // react 19: effects must not be async (this one never awaited anyway)
  useEffect(function getDataIfEmpty(){
    if(!slides || !tagsIndex){
      messageKnot.setState('Loading data.');
    }
    if(!slides){
      slidesKnot.getSlides()
        .then(res => {
          if(res.status != 200){
            messageKnot.setState(res.message + " Please try again later");  
          }
        });
    }
    if(!tagsIndex){
      tagsIndexKnot.getTags()
        .then(res => {
          if(res.status != 200){
            messageKnot.setState(res.message + " Please try again later");  
          }
        })
    }
  },[])

  useEffect(function transpileData(){
    /*
      this long function is aimed to output following data format:
      {
        "labels": string[],
        "tags": string[][], // each ground starts with a group title name
        "icons": [imageLink, projectId][*rows*][*columns*], // mimics the tags grouping and provies links and projectId in array
        "projectsIds": string[] //project ids used in the 
      }
    */ 
    if(!slides || !tagsIndex) return;
    messageKnot.setState(null);

    // TAGS INDEXATION
    // object to track used/unused tags
    const tagsUsage = {};
    const allTagNames = [];
    Object.values(tagsIndex).forEach( tags => tags.forEach(tag => {
      tagsUsage[tag] = 0;
      allTagNames.push(tag);
    }));
    const matchString = '# '+allTagNames.join(' ## ')+' #';
    const matchMap = {}; // mapping slides inputs to tags index names

    // SLIDES
    // consolidate by project
    const consolidatedByProject = {};
    const projects = [];

    // consolidate by project and index tags usage
    slides.forEach(slide => {
      // create new project if does not exist
      if(!consolidatedByProject[slide.project]){
        const newProject = [];
        consolidatedByProject[slide.project] = newProject;
        projects.push(newProject)

      }
      // push slide
      const project = consolidatedByProject[slide.project];
      project.push(slide);

      // index slide's tags
      slide.tags.forEach( ({tagname}) => {
        const regex = new RegExp('#[^#]*[\\s\\/:]'+String(tagname)+'[\\s\\/:][^#]*#', 'gi');
        const matches = [...matchString.matchAll(regex)];
        matches.forEach(match => {
          const matchedTagName = String(match[0]).replace(/#/g,'').trim();
          if(!matchMap[tagname]){
            matchMap[tagname] = [];
          } 
          matchMap[tagname].push(matchedTagName);

          // if selected tag is in the index
          if(tagsUsage[matchedTagName] != undefined){
            // increase count
            tagsUsage[matchedTagName]+=1;
          }
        });
      });
    });

    // TAGS ROW NUMBERS
    // order of tags to sort into rows
    const tagsRowsNumbers = {};
    let currentRow = 0;
    Object.entries(tagsIndex).forEach( ([title, members], g) => {
      let localRowCount = currentRow;

      members.forEach( (tag,i) => {
        if(tagsUsage[tag]){
          tagsRowsNumbers[tag] = ++localRowCount;
        }
      });

      // if current category has members -> add it to list
      if(localRowCount>currentRow){
        // add title before members rows
        tagsRowsNumbers[title] = currentRow;
        // set local count to outer counter
        currentRow = localRowCount;
        // move to empty row
        currentRow++
      }
    });

    // PROJECT IDS
    const projectsIds = projects.map(project => project[0]['publicId']); // return id of the first slide

    // LABLES
    const labels = projects.map(project => project[0]['project']);

    // TAGS
    const tags = [];

    Object
      .entries(tagsRowsNumbers)
      .sort( (ent, ent1) => ent[1] - ent1[1] )
      .reduce( (group, [tagname]) => {
        
        if(tagsIndex[tagname]){
          const newgroup = [];
          newgroup.push(tagname);
          tags.push(newgroup);
          return newgroup;
        }
        else {
          group.push(tagname);
          return group;
        }
      }, []);

    // used group titles
    const groupTitles = [];

    tags.forEach(tagsGroup => {
      groupTitles.push(tagsGroup[0])
    });

    const groupBreaks = [];
    groupTitles.forEach( groupTitle => {
      const rownum = tagsRowsNumbers[groupTitle];
      if(rownum === undefined) return;
      groupBreaks.push(rownum);

    });

    groupBreaks.sort((a, b) => b-a);

    const icons = [];
    projects.forEach((projectSlides,p) => {
      const allTags = [];
      projectSlides
        .forEach( 
          slide => slide.tags.forEach( 
            (tag) => {
              const {tagname} = tag;
              const matchedTagNames = matchMap[tagname];
              const itemToSet = [      
                settings.slideImageBase +
                slide.image+'?'
                +"x0="+tag.exp+"%"+"&"
                +"x1="+tag.eyp+"%"+"&"
                +"y0="+tag.sxp+"%"+"&"
                +"y1="+tag.syp+"%", 
                projectsIds[p]
              ]
              
              matchedTagNames?.forEach(matchedTagName => {
                const rownum = tagsRowsNumbers[matchedTagName];

                if(!rownum) return;
                allTags[rownum] = itemToSet; 
              });
          })
        );

      // add extra empty at group break
      groupBreaks.forEach( i => {
        allTags.splice(i,0,[null])
      } )
      
      icons.push(allTags);
    });

    // mar
    const transpiledData = {
      labels,
      tags,
      icons,
      projectsIds
    };
    setTranspiledData(transpiledData);

  }, [slides, tagsIndex]);


  return (
    <FolioIndex 
      mode="horizontal"
      labels={transpiledData.labels}
      tags={transpiledData.tags}
      icons={transpiledData.icons}
      projectsIds={transpiledData.projectsIds}
      >

      {!transpiledData.projectsIds
        ?
        <Loading scheme="blue"/>
        : null
      }

      {children}
    </FolioIndex>
    );
}