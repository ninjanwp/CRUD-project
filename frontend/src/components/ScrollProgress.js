import { motion, useScroll } from "framer-motion"

export default function ScrollLinked() {
    const { scrollYProgress } = useScroll()

    return (
            <motion.div
                id="scroll-indicator"
                style={{
                    scaleX: scrollYProgress,
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 1,
                    originX: 0,
                    
                    backgroundColor: "var(--bs-dark)",
                }}
            />
    )
}