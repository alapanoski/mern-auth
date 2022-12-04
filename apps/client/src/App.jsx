import React from "react"

import { useCookies } from "react-cookie"

import Login from "./Login"
import Signup from "./Signup"

function App() {
  const [cookies, setCookie, removeCookie] = useCookies(["auth_token"])

  return (
    <>
      <Signup />
      <Login />
      <button
        onClick={() => {
          removeCookie("auth_token", {
            path: "/",
          })
        }}
      >
        Log out
      </button>
      <button
        onClick={() => {
          console.log(cookies.auth_token)
        }}
      >
        Get auth_token from cookie store
      </button>
      <button
        onClick={async () => {
          await fetch("http://localhost:8080/user/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${cookies.auth_token}`,
            },
          })
            .then((res) => {
              return res.json()
            })
            .then((data) => {
              console.log(data)
            })
        }}
      >
        Get username from token
      </button>

      <button
        onClick={async () => {
          await fetch("http://localhost:8080/user/auth", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${cookies.auth_token}`,
            },
          })
            .then((res) => {
              return res.json()
            })
            .then((data) => {
              console.log(data)
            })
        }}
      >
        Test middleware
      </button>
    </>
  )
}

export default App
