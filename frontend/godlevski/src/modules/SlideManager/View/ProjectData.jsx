import Input, {InputG} from "../../../components/Input/Input";
import styles from "./styles.module.css";
import {useState, useEffect} from "react";
export default ({
  inputProject,
  inputClient,
  inputDate,
  inputTools,
  form={},
}) => {
  const [client, setClient] = useState();
  const [date, setDate] = useState();
  const [tools, setTools] = useState();
  const [project, setProject] = useState();

  useEffect(function setValues(){
    setClient(inputClient);
    setDate((inputDate+'').replace(/T.*/g,''));
    setProject(inputProject);
    setTools(inputTools);
  }, [inputProject, inputClient, inputDate, inputTools]);

  function handleKeyDown(fn, e){
    const newValue = e.target.value;
    fn(newValue);
  }
  return (
  <div className={styles.projectDataContainer}>
      <InputG
        onChange={(e) => handleKeyDown(setProject, e) }
        form={form}
        name="project"
        type="text"
        value={project}
        placeholder="Project Name"
        label="Project Name"
        className={styles.projectField+' '+styles.inputGroup}
        />
      <InputG
        form={form} 
        onChange={(e) => handleKeyDown(setClient, e) }
        name="client"
        type="text"
        value={client}
        placeholder="Client Name"
        label="Client Name"
        className={styles.projectField+' '+styles.inputGroup}
        />
      <InputG
        form={form} 
        onChange={(e) => handleKeyDown(setTools, e) }
        name="tools"
        type="text"
        value={tools}
        placeholder={inputTools||null}
        label="Tools"
        className={styles.projectField+' '+styles.inputGroup}
        />
      <InputG
        form={form}
        onChange={(e) => handleKeyDown(setDate, e) }
        name="date"
        type="date"
        value={date}
        
        placeholder="Date Originated"
        label="Date Originated"
        className={styles.projectField+' '+styles.inputGroup}
        />
    </div>);
}