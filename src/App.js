import { useState } from 'react';
import './App.css';
import { Button, Form } from 'react-bootstrap';
import Loader from './Loader';
import { encode as base64_encode } from 'base-64';
import { Text } from './Text';
// require('dotenv').config()
const IPFS = require('ipfs-api');
// import {create as IPFS} from 'ipfs-http-client'
const projectId = '2HcBXbYaQeMLWruLEdKFaRhM33j';
        const projectSecret = '9e3b7bf9d530be2b35cb49b24bf5fa88';
let secrets = projectId + ':' + projectSecret;
let encodedSecrets = base64_encode(secrets);
const ipfs = new IPFS({
  host: 'ipfs.infura.io', port: 5001, protocol: 'https', headers: {
    Authorization: 'Basic ' + encodedSecrets
  }
});

function App() {
  const [buf, setBuf] = useState();
  const [hash, setHash] = useState("");
  const [loader, setLoader] = useState(false);
  const [showLinks, setShowLinks] = useState(false);

  const captureFile = (event) => {
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]
    // const file=event.target.value;
    let reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => convertToBuffer(reader)
    // convertToBuffer(file);
  };

  const convertToBuffer = async (reader) => {
    //file is converted to a buffer to prepare for uploading to IPFS
    const buffer = await Buffer.from(reader.result);
    setBuf(buffer);
  };
  const onSubmit = async (event) => {
    event.preventDefault();
    setLoader(true);
    let ipfsId
    const buffer = buf
    await ipfs.add(buffer)
      .then((response) => {
        ipfsId = response[0].hash
        console.log("Generated IPFS Hash: ", ipfsId)
        setHash(ipfsId);
      }).catch((err) => {
        console.error(err)
        alert('An error occurred. Please check the console');
      })
    if (ipfsId)
      setShowLinks(true)
    else
      setShowLinks(false)
    setLoader(false);
  }
  if (loader) {
    return (
      <Loader />
    )
  }
  return (
    <div>
      <h1>Upload files to IPFS</h1>
      <h5> Choose file to upload to IPFS </h5>
      <Form onSubmit={onSubmit}>
        <input type="file" onChange={captureFile} required />
        <Button type="submit">Upload</Button>
      </Form>
      {
        showLinks ?
          <div>
            <p>---------------------------------------------------------------------------------------------</p>
            <h6>IPFS Hash: {hash}</h6>
            <p>Non clickabe Link: https://ipfs.io/ipfs/{hash}</p>
            <a href={"https://ipfs.io/ipfs/" + hash}>Clickable Link to view file on IPFS</a>
            <img src={"https://ipfs.io/ipfs/" + hash} alt=''/>
          </div> :
          <p></p>

      }
      {/* <Text/> */}
    </div>
  );
}

export default App;
