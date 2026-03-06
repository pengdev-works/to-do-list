function Header() {
    return (
        <header className="sticky top-0 z-50 w-full mb-8">
            <div className="bg-white/40 backdrop-blur-md border-b border-white/20 shadow-sm py-4">
                <div className="max-w-4xl mx-auto px-6 flex justify-center items-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 drop-shadow-sm">
                            To-Do-List
                        </span>
                    </h1>
                </div>
            </div>
        </header>
    )
}

export default Header