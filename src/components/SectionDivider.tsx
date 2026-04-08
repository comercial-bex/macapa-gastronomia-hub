import { motion } from "framer-motion";

const SectionDivider = () => (
  <div className="flex items-center justify-center py-6 gap-3">
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40 origin-left"
    />
    <motion.div
      initial={{ scale: 0, rotate: -45 }}
      whileInView={{ scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      className="w-1.5 h-1.5 bg-primary/60 rotate-45"
    />
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40 origin-right"
    />
  </div>
);

export default SectionDivider;
