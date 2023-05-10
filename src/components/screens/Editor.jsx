import React, { useState } from 'react'
import axios from 'axios'

// styles
import '../../themes/editor.scss'

function Editor() {
    const [code, setCode] = useState('')
    const [output, setOutput] = useState('')
    const [error, setError] = useState('')

    const [languages] = useState([
        {value: 'cpp', text: 'C++'},
        {value: 'python', text: 'Python'},
    ])
    const [selectedLanguage, setselectedLanguage] = useState(languages[0].value)

    const handleLanguageChange = (event) => {
        setselectedLanguage(event.target.value)
    }

    console.log("selected",selectedLanguage)

    const codeSubmit = async () => {
        console.log(selectedLanguage);
        const payload = {
            language: selectedLanguage,
            code
        }

        await axios.post('http://localhost:9000/api/v1/compiler/run/', payload)
            .then((response)=> {
                // console.log(response)
                response?.data?.error?.stdError ? 
                    setError(response?.data?.error?.stdError) : setError('')

                response?.data?.output ?
                     setOutput(response?.data?.output) : setOutput('')
            })
            .catch((error)=> {
                console.log(error)
            })
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
