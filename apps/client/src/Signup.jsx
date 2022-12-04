import React, { useState } from "react"

import { useCookies } from "react-cookie"

function Signup() {
  const [user, setUser] = useState({
    username: "",
    password: "",
  })
  const [cookies, setCookie, removeCookie] = useCookies(["auth_token"])

  const handleChange = (e) => {
    const { name, value } = e.target
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await fetch("http://localhost:8080/user/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        console.log(data)
        setCookie("auth_token", data.token, {
          path: "/",
        })
      })
  }

  return (
    <div>
      <h1>Signup</h1>{" "}
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          name="username"
          type="text"
          id="username"
          onChange={handleChange}
        />
        <label htmlFor="password">Password</label>
        <input
          name="password"
          type="password"
          id="password"
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default Signup
