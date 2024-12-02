import { useEffect, useState } from "react"
import TopBar from "./components/TopBar";
import Container from "./components/Container";



function App() {

  // const [priceArry, setPriceArry] = useState([]);

  // const ipcHandle = () => window.electron.ipcRenderer.send('fetch-data');

  // useEffect(() => {


  //   window.electron.ipcRenderer.on("fetch-data-response", (event, args) => {
  //     console.log(args);
  //     setPriceArry(args);
  //   })

  // }, []);



  return (
    <>
      <TopBar />
      <Container />
    </>
  )
}

export default App

