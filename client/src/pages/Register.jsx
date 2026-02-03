function Register() {
  return (
    <> 
          <div className="min-h-screen flex items-center justify-center bg-linear-210 from-gray-800 to-blue-950 transition">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm hover:bg-gray-800 transition">

          <h1 className="text-7xl font-bold text-center mb-4 text-blue-600 hover:text-green-800 transition">
            Register
          </h1>

          <form className="space-y-3">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-3 py-2 border border-green-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         hover:bg-blue-100 transition"
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 border border-green-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         hover:bg-blue-100 transition"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 border border-green-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         hover:bg-blue-100 transition"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-3 py-2 border border-green-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         hover:bg-blue-100 transition"
            />

            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-green-700 transition"
            >
              Register
            </button>

            <br /><br />

            <div className="text-center text-gray-400">— or —</div>

            <p className="text-center mb-4">
              already have an account?{' '}
              <a
                href="/"
                className="text-blue-500 hover:text-green-500 transition"
              >
                login here
              </a>
            </p>

          </form>
        </div>
      </div>
    </>
  )
}

export default Register
