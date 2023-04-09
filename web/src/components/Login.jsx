import './Login.css'

const Auth = () => {
  return (
    <form className="auth-form">
      <input placeholder="email" />
      <input placeholder="password" type="password" />
    </form>
  )
}

const action = async ({ request }) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  console.log(updates)
}

export default Auth
