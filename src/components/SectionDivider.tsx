import { motion } from "framer-motion";

const SectionDivider = () => (
  <div className="flex justify-center py-4">
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-px w-24 bg-primary origin-center"
    />
  </div>
);

export default SectionDivider;
