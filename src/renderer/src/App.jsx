import { useEffect, useState } from "react"



function App() {

  const [priceArry, setPriceArry] = useState([]);

  const ipcHandle = () => window.electron.ipcRenderer.send('fetch-data');

  useEffect(() => {


    window.electron.ipcRenderer.on("fetch-data-response", (event, args) => {
      console.log(args);
      setPriceArry(args);
    })

  }, []);



  return (
    <>

      <div onClick={ipcHandle}>sdfsdfsdf</div>

      <div>
        {priceArry.map((price) => price.model)}
      </div>

    </>
  )
}

export default App

