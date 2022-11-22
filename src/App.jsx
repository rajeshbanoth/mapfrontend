import React from 'react'
import Driver from './components/Driver'
import User from './components/User'
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App(props) {
  

  return (
    <>

<BrowserRouter>

<Routes>
  <Route  path={"/"} element={<User/>}/>
  <Route  path={"/driver"} element={<Driver/>}/>

</Routes>
</BrowserRouter>
     
    </>
  )
}
