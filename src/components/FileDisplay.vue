<template>
  <div class="file-display" @click="handleClick">
    <div class="image-container">
      <img
        :src="imageUrl"
        alt="Crochet pattern preview"
        class="preview-image"
      />
    </div>
    <div class="text-preview">
      <p>{{ firstLine }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  file: {
    type: Object,
    default: () => ({ items: [] }),
  },
});

const emit = defineEmits(["click"]);

const handleClick = () => {
  emit("click", props.file);
};

// Array of crochet-related placeholder images (via Unsplash or similar)
const crochetImages = [
  "https://images.pexels.com/photos/2070676/pexels-photo-2070676.jpeg",
  "https://images.pexels.com/photos/2767689/pexels-photo-2767689.jpeg",
  "https://images.pexels.com/photos/2767667/pexels-photo-2767667.jpeg",
];

// Get a consistent random image based on file id
const getRandomImage = (fileId) => {
  if (!fileId) {
    const idx = Math.floor(Math.random() * crochetImages.length);
    return crochetImages[idx];
  }
  // Use file id to consistently pick the same random image for each file
  const hash = fileId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const idx = hash % crochetImages.length;
  return crochetImages[idx];
};

// Use file's image if available, otherwise use random placeholder
const imageUrl = computed(() => {
  // If file has an image, use it
  if (props.file?.image) {
    return props.file.image;
  }
  // Otherwise, use a random crochet image
  return getRandomImage(props.file?.id);
});

// Extract the first line from the file's items array
const firstLine = computed(() => {
  if (!props.file || !props.file.items || props.file.items.length === 0) {
    return "No content available";
  }
  // items is an array of strings; take the first one
  const firstItem = props.file.items[0];
  return firstItem || "Empty file";
});
</script>

<style scoped>
.file-display {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: var(--color-bg-light);
  max-width: 320px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.file-display:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px var(--color-primary);
}
.image-container {
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 6px;
}
.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.text-preview {
  font-size: 0.95rem;
  color: var(--color-text-dark);
}
.text-preview p {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
