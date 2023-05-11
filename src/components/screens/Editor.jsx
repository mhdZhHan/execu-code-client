import React, { useEffect, useState } from 'react'
import axios from 'axios'

// utils
import { stubs } from '../../utils'

// styles
import '../../themes/editor.scss'

function Editor() {
    const [code, setCode] = useState('')

    const [output, setOutput] = useState('')
    const [error, setError] = useState('')
    
    const [taskId, setTaskId] = useState('')
    const [taskStatus, setTaskStatus] = useState('')

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

    useEffect(()=> {
        setCode(stubs[selectedLanguage])
    }, [selectedLanguage])

    const codeSubmit = async () => {
        const payload = {
            language: selectedLanguage,
            code
        }

        try {
            setOutput('')
            setError('')
            setTaskId('')
            setTaskStatus('')

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
                    if(status){
                        const { status: taskstatus, output: taskOutput } = task
                        setTaskStatus(taskstatus)

                        if(taskstatus === 'pending') return
                        setOutput(taskOutput)

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
                    <div className="output_box">
                        <div className="info">
                            {taskId && <div className='flex'>
                                <span className='label'>Task id: </span>
                                <span className='taskId'>{taskId}</span>
                            </div>}
                            {taskStatus && <div className='flex'>
                                <span className='label'>Status: </span>
                                <span className='taskstatus'>{taskStatus}</span>
                            </div>}
                        </div>
                        {output && output}
                    </div>

                    <div className="error_box">
                        {error && error}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Editor
