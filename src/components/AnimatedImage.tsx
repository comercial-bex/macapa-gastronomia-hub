import { motion } from "framer-motion";

interface AnimatedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

const AnimatedImage = ({ src, alt, className = "", loading = "lazy" }: AnimatedImageProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 1.08 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    className="overflow-hidden"
  >
    <img src={src} alt={alt} className={className} loading={loading} />
  </motion.div>
);

export default AnimatedImage;
