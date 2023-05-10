import React, { useState } from 'react'
import axios from 'axios'

// styles
import '../../themes/editor.scss'

function Editor() {
    const [code, setCode] = useState('')
    const [output, setOutput] = useState('')

    const codeSubmit = async () => {
        const payload = {
            language: 'cpp',
            code
        }

        await axios.post('http://localhost:9000/api/v1/compiler/run/', payload)
            .then((response)=> {
                // console.log(response)
                setOutput(response?.data.output)
            })
            .catch((error)=> {
                console.log(error)
            })
    }

    return (
        <div className="container">
            <div className="wrapper">
                <h1 className="title">Execu Code Demo</h1>
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
                        error occoure
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Editor
