import React, { useEffect, useState } from 'react'
import axios from 'axios'
import moment from 'moment'

// utils
import { stubs } from '../../utils'

// styles
import '../../themes/editor.scss'

function Editor() {
    const [code, setCode] = useState('')
    
    const [taskoutput, setTaskOutput] = useState('')
    const [taskError, setTaskError] = useState('')
    const [taskId, setTaskId] = useState('')
    const [taskStatus, setTaskStatus] = useState('')
    const [taskDetails, setTaskDetails] = useState(null)

    // const task execution details states
    const [taskSubmited, setTaskSubmited] = useState('')
    const [executionTime, setExecutionTime] = useState('')

    const [languages] = useState([
        {value: 'cpp', text: 'C++'},
        {value: 'py', text: 'Python'},
    ])
    const [selectedLanguage, setselectedLanguage] = useState(languages[0].value)

    const handleLanguageChange = (event) => {
        // let confrim = window.confirm(
        //     "WARNING: Switching the language will remove your current code."
        // )
        setselectedLanguage(event.target.value)
    }

    const setDefaultLanguage = () => {
        localStorage.setItem('default_language', selectedLanguage)
        console.log(`${selectedLanguage} is set as default language`)
    }

    useEffect(()=> {
        let defaultLanguage = localStorage.getItem('default_language') || languages[0].value
        setselectedLanguage(defaultLanguage)
    }, [])

    useEffect(()=> {
        console.log('task details',taskDetails)
        if(taskDetails){
            let { submittedAt, startedAt, completedAt } = taskDetails
            const submitedTime = moment(submittedAt).toString()
            setTaskSubmited(submitedTime)
            // if(!startedAt || !completedAt){
            //     setTaskSubmited(submitedTime)
            // }
    
            const startTime = moment(startedAt)
            const endTime = moment(completedAt)
            const completedTime = endTime.diff(startTime, 'seconds', true)
            setExecutionTime(completedTime)
        }
    }, [taskDetails])

    useEffect(()=> {
        setCode(stubs[selectedLanguage])
    }, [selectedLanguage])

    const codeSubmit = async () => {
        const payload = {
            language: selectedLanguage,
            code
        }

        try {
            setTaskOutput('')
            setTaskError('')
            setTaskId('')
            setTaskStatus('')
            setTaskDetails(null)

            const { data } = await axios.post('http://localhost:9000/api/v1/compiler/run/', payload)

            data?.taskId ? setTaskId(data?.taskId) : setTaskId('')

            let getStatusInterval = setInterval(async ()=> {
                await axios.get(
                    'http://localhost:9000/api/v1/compiler/task/status',
                    { params: { id: data?.taskId } }
                )
                .then(({ data })=> { 
                    console.log(data)
                    const { status, task } = data
                    console.log("Status",status)
                    setTaskDetails(data?.task)
                    console.log('hhegfh', taskDetails)
                    if(status){
                        setTaskStatus(task?.status)

                        if(task?.status === 'pending') return
                        task?.status === 'success' && setTaskOutput(task?.output)
                        task?.status === 'error' && setTaskError(task?.error)

                        clearInterval(getStatusInterval)
                    }
                })
                .catch((error)=> {
                    console.log(error)
                    getStatusInterval(getStatusInterval)
                })
            }, 1000)

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="container">
            <div className="wrapper">
                <h1 className="title">Execu Code Demo</h1>
                <div className="head">
                    <div className="select_box">
                        <label htmlFor="for_select">Select language: </label>
                        <select 
                            id='for_select'
                            value={selectedLanguage} 
                            onChange={handleLanguageChange}
                        >
                            {languages.map((language, index ) => (
                                <option 
                                    key={index} 
                                    value={language?.value}
                                >{language?.text}</option>
                            ))}
                        </select>
                    </div>

                    <div className="button_box">
                        <button onClick={setDefaultLanguage}>Set as default</button>
                    </div>
                </div>

                <div className="editor_container">
                    <textarea 
                        className='editor_box'
                        cols="40" 
                        rows="10"
                        value={code}
                        onChange={(event)=> setCode(event.target.value)}
                    >
                    </textarea>
                    <br />
                    <button
                        className='execute_button'
                        onClick={codeSubmit}
                    >Run Code</button>
                </div>

                <h2 className='title'>Result</h2>
                <div className="output_container">
                    <div className="top">
                        <div className="info">
                            {taskId && <div className='left'>
                                <div className="flex">
                                    <span className='label'>Task id: </span>
                                    <span className='taskId'>{taskId}</span>
                                </div>
                            </div>}
                            {taskStatus && <div className='right'>
                                <div className="flex">
                                    <span className='label'>Status: </span>
                                    <span className='taskstatus' style={{
                                        color: taskStatus === 'error' ? 'red' : 'rgb(5, 185, 92)',
                                    }}>{taskStatus}</span>
                                </div>
                                {/* <div className="flex">
                                    <span className='label'>Submited at: </span>
                                    <span className='taskstatus'>{taskSubmited}</span>
                                </div> */}
                                <div className="flex">
                                    <span className='label' >Execution time: </span>
                                    <span className='taskstatus' style={{
                                        color: taskStatus === 'error' ? 'red' : 'rgb(5, 185, 92)',
                                    }}>{executionTime}</span>
                                </div>
                            </div>}
                        </div>
                    </div>

                    <div className="bottom_flex">
                        <div className="output_box">
                            {taskoutput && taskoutput}
                        </div>

                        <div className="error_box">
                            {taskError && taskError}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Editor
