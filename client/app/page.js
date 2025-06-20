"use client"
import { Search, Send, Loader2, YoutubeIcon, Tag, Clock, Filter, X, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { diagnosisList } from "./diagnosisList"
import dxDataRaw from "../public/dx.json" assert { type: "json" };

const processVideoUrl = (url, startTime) => {
  if (!url) return "#"
  // Clean up the URL by removing newlines and whitespace
  const cleanUrl = url.replace(/\n/g, "").trim()
  // Convert time to nearest seconds if it exists
  if (startTime) {
    const timeInSeconds = Math.round(Number.parseFloat(startTime))
    const separator = cleanUrl.includes("?") ? "&" : "?"
    return `${cleanUrl}${separator}t=${timeInSeconds}`
  }
  return cleanUrl
}

const filterMedicalTags = (entities) => {
  if (!entities) return []
  return entities.filter((entity) => ["T184", "T047"].includes(entity.semantic_type)).map((entity) => entity.text)
}

export default function Home() {
  const [inputValue, SetInputValue] = useState("")
  const [displayText, SetDisplayText] = useState("Clinical Problem Solvers")
  const [results, SetResults] = useState([])
  const [allResults, setAllResults] = useState([]) // Store all videos
  const [loading, setLoading] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [selectedTranscript, setSelectedTranscript] = useState(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [showFilter, setShowFilter] = useState(false)
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([])
  const [diagnosisInput, setDiagnosisInput] = useState("")
  const [dxResults, setDxResults] = useState([])

  // Filter results by selected diagnoses if set
  const filteredResults = selectedDiagnoses.length > 0
    ? allResults.filter(item => selectedDiagnoses.some((dx) => (item.final_dx || "").toLowerCase().includes(dx.toLowerCase())))
    : results

  const handleSend = async () => {
    setLoading(true)
    SetResults([])
    setLoadingProgress(0)
    
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + Math.random() * 20, 90))
    }, 300)

    try {
      const res = await fetch(`http://localhost:5000/search?query=${inputValue}`)
      const data = await res.json()
      setLoadingProgress(100)
      SetResults(data.matches || [])
      setAllResults(data.all_videos || data.matches || []) // Use all_videos if available, fallback to matches
    } catch (e) {
      SetResults([])
      setAllResults([])
    } finally {
      clearInterval(progressInterval)
      setTimeout(() => {
        setLoading(false)
        setLoadingProgress(0)
      }, 500)
    }
  }

  const handleTranscriptClick = (item) => {
    setSelectedTranscript(item)
    setShowTranscript(true)
  }

  // On initial load, fetch all videos for diagnosis filtering
  useEffect(() => {
    async function fetchAllVideos() {
      try {
        const res = await fetch("http://localhost:5000/all_videos")
        const data = await res.json()
        setAllResults(data || [])
      } catch {}
    }
    fetchAllVideos()
  }, [])

  // Fetch dx.json and filter by Final Dx
  useEffect(() => {
    if (selectedDiagnoses.length > 0) {
      // If dx.json is not loaded, load and filter
      const dxData = dxDataRaw || {};
      const filtered = Object.entries(dxData).filter(([url, meta]) =>
        selectedDiagnoses.some(dx => (meta["Final Dx"] || "").toLowerCase().includes(dx.toLowerCase()))
      ).map(([url, meta]) => ({ url: url.trim(), ...meta }))
      setDxResults(filtered)
    } else {
      setDxResults([])
    }
  }, [selectedDiagnoses])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white flex flex-col items-center px-4 py-12"
    >
      <AnimatePresence>
        {!results.length && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-4xl text-center mb-16"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400"
            >
              {displayText}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >              
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 mt-10"
            >
              {[
                { icon: YoutubeIcon, text: "1000+ Videos", desc: "Curated medical content", color: "text-red-500" },
                { icon: Tag, text: "Smart Tagging", desc: "Automatic categorization", color: "text-blue-500" },
                { icon: Clock, text: "Timestamps", desc: "Jump to key moments", color: "text-green-500" },
                { icon: Filter, text: "Smart Filters", desc: "By symptoms & conditions", color: "text-purple-500" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                  whileHover={{ scale: 1.04, y: -3, transition: { duration: 0.15 } }}
                  className="p-2 rounded-xl bg-zinc-800/50 backdrop-blur border border-zinc-700/50 hover:border-zinc-600 transition-all duration-200 cursor-pointer"
                >
                  <div className="mb-2 flex justify-center">
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <p className="font-medium mb-0.5 text-sm text-white">{feature.text}</p>
                  <p className="text-xs text-zinc-400">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        className={`flex-1 ${results.length ? "mt-8" : ""} ${showTranscript ? "mr-96" : ""} transition-all duration-300`}
      >
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-semibold mb-2">Results for "{inputValue}"</h2>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  {results.length} matches found
                </motion.span>
                <span className="h-1 w-1 bg-zinc-700 rounded-full"></span>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  Showing most relevant first
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
          <AnimatePresence mode="wait">
            {loading ? (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full mb-8 relative h-2 bg-zinc-800 rounded-full overflow-hidden"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${loadingProgress}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                  />
                </motion.div>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="flex flex-col bg-gradient-to-br from-zinc-800/30 to-zinc-900/30 rounded-xl border border-zinc-700/50 overflow-hidden backdrop-blur"
                  >
                    <motion.div
                      animate={{ 
                        background: [
                          "linear-gradient(90deg, #1f2937 0%, #374151 50%, #1f2937 100%)",
                          "linear-gradient(90deg, #374151 0%, #1f2937 50%, #374151 100%)",
                          "linear-gradient(90deg, #1f2937 0%, #374151 50%, #1f2937 100%)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-full h-48"
                    />
                    <div className="p-6 space-y-4">
                      <motion.div
                        animate={{ opacity: [0.5, 0.7, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="h-4 bg-gradient-to-r from-zinc-700/50 via-zinc-600/50 to-zinc-700/50 rounded w-3/4"
                      />
                      <motion.div
                        animate={{ opacity: [0.5, 0.7, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        className="h-3 bg-gradient-to-r from-zinc-700/50 via-zinc-600/50 to-zinc-700/50 rounded w-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.5, 0.7, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                        className="h-3 bg-gradient-to-r from-zinc-700/50 via-zinc-600/50 to-zinc-700/50 rounded w-2/3"
                      />
                    </div>
                  </motion.div>
                ))}
              </>
            ) : selectedDiagnoses.length > 0 && dxResults.length > 0 ? (
              dxResults.map((item, index) => (
                <motion.a
                  key={item.url}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                  }}
                  whileHover={{
                    scale: 1.02,
                    y: -5,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.98 }}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col bg-zinc-800/30 rounded-xl border border-zinc-700/50 overflow-hidden hover:border-zinc-600 transition-all duration-300 relative backdrop-blur"
                >
                  <div className="relative overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                    />
                    {index < 3 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="absolute top-3 left-3 flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                        <span className="text-xs font-medium bg-white/20 border border-white/30 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                          Top Match
                        </span>
                      </motion.div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-medium text-lg mb-2 line-clamp-1">{item.title}</h3>
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{item.description}</p>
                    <div className="mb-2 text-xs text-blue-400 font-semibold">
                      {item["Final Dx"] && (
                        <span>Final Dx: {item["Final Dx"]}</span>
                      )}
                    </div>
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(item.title_extracted_entities || []).filter(e => ["T184", "T047"].includes(e.semantic_type)).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-white/10 text-xs text-white rounded-full border border-white/20"
                          >
                            {tag.text}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-700/50">
                        <div className="text-xs text-zinc-500">{item.upload_date}</div>
                        <div className="flex items-center gap-2">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black rounded-full text-xs flex items-center gap-1 transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            Watch
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))
            ) : filteredResults.length > 0 ? (
              filteredResults.map((item, index) => (
                <motion.a
                  key={item.id}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                  }}
                  whileHover={{
                    scale: 1.02,
                    y: -5,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.98 }}
                  href={processVideoUrl(item.url, item.start_time)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col bg-zinc-800/30 rounded-xl border border-zinc-700/50 overflow-hidden hover:border-zinc-600 transition-all duration-300 relative backdrop-blur"
                >
                  <div className="relative overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      src={item.metadata?.thumbnail}
                      alt={item.metadata?.title}
                      className="w-full h-48 object-cover"
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                    />
                    {index < 3 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="absolute top-3 left-3 flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                        <span className="text-xs font-medium bg-white/20 border border-white/30 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                          Top Match
                        </span>
                      </motion.div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute bottom-3 right-3 bg-black/90 text-xs px-2 py-1 rounded backdrop-blur-sm"
                    >
                      {Math.round(item.score * 100)}% match
                    </motion.div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-medium text-lg mb-2 line-clamp-1">{item.metadata?.title}</h3>
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{item.metadata?.description}</p>

                    <div className="mb-2 text-xs text-blue-400 font-semibold">
                      {item.final_dx && (
                        <span>Final Dx: {item.final_dx}</span>
                      )}
                    </div>

                    <div className="mt-auto">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap gap-2 mb-4"
                      >
                        {filterMedicalTags(item.metadata?.title_extracted_entities).map((tag, tagIndex) => (
                          <motion.span
                            key={tagIndex}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + tagIndex * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                            className="px-2 py-1 bg-white/10 text-xs text-white rounded-full border border-white/20"
                          >
                            {tag}
                          </motion.span>
                        ))}
                      </motion.div>

                      <div className="flex items-center justify-between pt-4 border-t border-zinc-700/50">
                        <div className="text-xs text-zinc-500">{item.metadata?.upload_date}</div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs text-zinc-300 flex items-center gap-1 transition-colors"
                            onClick={(e) => {
                              e.preventDefault()
                              handleTranscriptClick(item)
                            }}
                          >
                            <FileText className="w-3 h-3" />
                            Transcript
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black rounded-full text-xs flex items-center gap-1 transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            Watch
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="col-span-full flex flex-col items-center justify-center p-12 bg-zinc-800/30 rounded-xl border border-zinc-700/50"
              >
                <div>
                  <Search className="w-16 h-16 text-zinc-600 mb-4" />
                </div>
                <p className="text-xl font-medium mb-2">Start your clinical search</p>
                <p className="text-zinc-400">Use medical terms, symptoms, or specific conditions</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-96 bg-zinc-900/95 border-l border-zinc-700/50 backdrop-blur-lg"
          >
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Transcript Data</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowTranscript(false)}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              {selectedTranscript && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-sm text-zinc-400 space-y-2">
                    <p>Timestamp: {selectedTranscript.start_time}s</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <h5 className="text-sm font-medium mb-2">Transcript:</h5>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap">{selectedTranscript.text}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <h5 className="text-sm font-medium mb-2">Medical Tags:</h5>
                    <div className="flex flex-wrap gap-2">
                      {filterMedicalTags(selectedTranscript.metadata?.title_extracted_entities).map((tag, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          className="px-2 py-1 bg-white/10 rounded-full text-xs text-white border border-white/20"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="fixed bottom-6 w-11/12 max-w-3xl"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 bg-zinc-800/90 border border-zinc-700/50 rounded-full px-6 py-4 shadow-lg backdrop-blur"
        >
          <Search className="text-zinc-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for clinical cases..."
            value={inputValue}
            onChange={(e) => SetInputValue(e.target.value)}
            className="flex-grow outline-none text-white placeholder-zinc-500 bg-transparent text-lg"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend()
            }}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={loading}
            className={`p-2.5 rounded-full bg-white hover:bg-zinc-200 text-black transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <motion.div
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: loading ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
            >
              {loading ? <Loader2 className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            </motion.div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFilter(true)}
            className="ml-2 p-2.5 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white transition-colors relative"
            aria-label="Filter"
          >
            <Filter className="w-5 h-5" />
            {selectedDiagnoses.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 border-2 border-zinc-800 shadow">
                {selectedDiagnoses.length}
              </span>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {showFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              transition={{ duration: 0.25 }}
              className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-700/50 rounded-2xl p-5 w-full max-w-md shadow-2xl flex flex-col gap-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white text-base">Diagnosis Filter</span>
                <button
                  className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400"
                  onClick={() => setShowFilter(false)}
                  aria-label="Close filter"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1 mb-2 min-h-[28px]">
                {selectedDiagnoses.length === 0 && <span className="text-xs text-zinc-500">No diagnoses selected</span>}
                {selectedDiagnoses.map(dx => (
                  <span key={dx} className="flex items-center bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">
                    {dx}
                    <button
                      className="ml-1 text-white/80 hover:text-white"
                      onClick={() => setSelectedDiagnoses(selectedDiagnoses.filter(d => d !== dx))}
                      aria-label={`Remove ${dx}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={diagnosisInput}
                  onChange={e => setDiagnosisInput(e.target.value)}
                  placeholder="Type to filter..."
                  className="bg-zinc-800 text-white px-2 py-1 rounded-full outline-none text-xs w-40 border border-zinc-700 focus:border-blue-500 transition"
                  autoFocus
                />
                <button
                  className="px-2 py-1 rounded-full bg-zinc-700 text-white text-xs hover:bg-zinc-600 border border-zinc-600"
                  onClick={() => {
                    setSelectedDiagnoses([])
                    setDiagnosisInput("")
                  }}
                >Clear</button>
              </div>
              <div className="flex flex-col gap-1 overflow-y-auto max-h-40 mt-1 pb-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 bg-zinc-800 rounded-lg p-2 border border-zinc-700"
                style={{ WebkitOverflowScrolling: 'touch' }}>
                {diagnosisList.filter(dx => dx.toLowerCase().includes(diagnosisInput.toLowerCase()) && !selectedDiagnoses.includes(dx)).length === 0 ? (
                  <span className="text-xs text-zinc-500">No matches</span>
                ) : diagnosisList.filter(dx => dx.toLowerCase().includes(diagnosisInput.toLowerCase()) && !selectedDiagnoses.includes(dx)).map(dx => (
                  <button
                    key={dx}
                    className="px-2 py-1 rounded-full border text-xs whitespace-nowrap bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-blue-600 hover:text-white text-left transition"
                    onClick={() => setSelectedDiagnoses([...selectedDiagnoses, dx])}
                  >
                    {dx}
                  </button>
                ))}
              </div>
              <button
                className="mt-3 px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold self-end shadow"
                onClick={() => setShowFilter(false)}
              >
                Filter by Dx
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
