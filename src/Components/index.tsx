import React, {useEffect, useState} from 'react';
import { BigNumber, ethers } from "ethers";
import NFT from '../abi/NFT.json';
import fs from 'fs'
import { NFTStorage, File } from 'nft.storage'
declare var window: any
const nftCount = 3;

const endpoint:any = 'https://api.nft.storage' // the default
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEVBN2JDMDZEMzE0RUE2NDdlMGE3OTQ2OUE2YzUwZmFiODhENzdCNDUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0NDIwMzYyNTc4MiwibmFtZSI6IlNBTU5GVCJ9.otzi5G8BCGhtZKC3gKxkBujM9fA4iuHayc8Q4_3dHME' // your API key from https://nft.storage/manage
const contractAddress = '0x16C66dA9b55Ad52Dd779328d38496271DEa99438';

export interface ButtonProps {
  onClick?: () => void;
  caption?: string;
  style?: object;
}
function CustomizeButton(props:ButtonProps){
  return(
    <div 
      onClick = {props.onClick}
      style={{
        display: 'flex',
        borderRadius:'10px', 
        width:'150px', 
        height:'40px', 
        cursor:'pointer', 
        background:'blue',
        justifyContent:'center',
        alignItems:'center',
        color:'white',
        fontSize:'20px',
        marginTop:'50px',
        ...props.style
      }}
    >
        {props.caption}
      </div>
  )
}
export default function MainPage()
{
  // let metadata:Array<any> = [];
  const [metadata, setMetadata] = useState<Array<any>>([], );
  const [nft, setNft] = useState({});
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');

  const fetchNFTS = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const nftContract = new ethers.Contract(contractAddress, NFT.abi, provider);

    let _metadata:Array<any> = [];
    for(let i=1; i<=nftCount; i++){
      let uri = await nftContract.tokenURI(i);

      await fetch(uri)
      .then(response => response.json())
      .then(data => {
        _metadata.push(data);
      });
    }
    setMetadata(_metadata);
  };

  // useEffect(()=>{
  //   fetchNFTS();
  // },[]);

  const selectNFT = () => {
    document.getElementById('fileSelector')?.click();
  }
  const onChangeNFT = (e:any) => {
    setNft(e.target.files[0])
    let src=  window.URL.createObjectURL(e.target.files[0]);
    let preview:any = document.getElementById('preview');
    preview.src = src;

  }
  const upload = async () => {
    console.log("mint");

    var file:any = nft;
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = async function(e:any) {
      var contents = e.target.result;

      const storage = new NFTStorage({ endpoint, token })
      const metadata = await storage.store({
        name: 'nft.storage store test',
        description:
          'Using the nft.storage metadata API to create ERC-1155 compatible metadata.',
        image: new File([contents], 'pinpie.jpg', {
          type: 'image/jpg',
        }),
      })
      console.log('IPFS URL for the metadata:', metadata.url)
      console.log(metadata.data.image);
      console.log('metadata.json contents:\n', metadata.data) 
      console.log(
        'metadata.json contents with IPFS gateway URLs:\n',
        metadata.embed()
      )
    };
    reader.readAsArrayBuffer(file);
  }
  const mint = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const nftContract = new ethers.Contract(contractAddress, NFT.abi, signer);
    const mintPrice = ethers.utils.parseUnits("0.08", "ether");

    let gas = await nftContract.estimateGas.mintTo(account,{value: mintPrice});
    gas = gas.mul(12).div(10);

    let result = await nftContract.mintTo(account, {gasLimit:gas, value:mintPrice});
  console.log(result);
  }
  const connectTo = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const account = accounts[0];

    setAccount(accounts[0]);
    // const signer = provider.getSigner();

    let balance = await provider.getBalance(account);
    setBalance(ethers.utils.formatEther(balance));
    // let tmp = balance.div(ethers.constants.WeiPerEther).toNumber();
  }
  
  return(
    <div style={{display:'flex', flexDirection:'row'}}>
      <div 
        style={{
          display:'flex', 
          flexDirection:'column', 
          justifyContent:'center', 
          alignItems:'center',
          width: '50%'
        }}
      >
        <div 
          style={{
            color:'blue',
            fontSize:'50px'
            }}
        >
          Mint your NFT on the Blockchain with 0.08 Ether
        </div>
        <CustomizeButton caption="Mint" onClick={mint} />
      </div>
      <div style={{width:'50%'}}>
        <div            
          style={{
              display:'flex', 
              flexDirection:'column', 
              justifyContent:'center', 
              alignItems:'flex-end'
            }}
        >
          <CustomizeButton caption="Connect" onClick={connectTo} style={{marginRight:'50px'}}/>
          <div>
            <div>{account}</div>
            <div>{balance}</div>
          </div>
        </div>
        <div>
        <img src='logo512.png' alt='loading'/>
        </div>
      </div>
    </div>
      // {/* <div>
      //   <input type="text" width='500px' placeholder='input description'/>
      //   <button onClick={selectNFT}>Select NFT</button>
      //   <button onClick={mint}>mint</button>
      //   <button onClick={connectTo}>Connect</button>
      //   <h3>{account}</h3>
      //   <h3 style={{marginLeft:'10px'}}>{balance}</h3>
      //   <input 
      //     id="fileSelector" 
      //     type="file" 
      //     style={{display:'none'}} 
      //     onChange={(e)=>onChangeNFT(e)}
      //     name="image_uploads" 
      //     accept=".jpg, .jpeg, .png"
      //   />
      // </div>
      // <div id="previewPanel">
      //   <img id="preview" alt="Not selected" height='100px'/>
      // </div>
      // <div id="nfts" style={{display:'flex', flexDirection:'column'}}>
      //   {metadata.map((item, index) => (
      //     <div 
      //       style={{
      //         display : 'flex', 
      //         flexDirection : 'row', 
      //         justifyContent : 'center',
      //         alignItems : 'center'
      //       }} 
      //       key={index}
      //     >
      //       <div>{item.name}</div>
      //       <img alt="loading" src={item.image} height='100px' />
      //     </div>
      //   ))}
      // </div> */}
  )
}