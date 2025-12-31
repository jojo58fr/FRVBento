export const COMMON_BLOCK_CSS = `
.bento-item .full-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.bento-item:hover .full-img {
  transform: scale(1.05);
}

.bento-item .media-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0));
  color: #ffffff;
}

.bento-item .media-title {
  font-weight: 600;
  line-height: 1.3;
}

.bento-item .media-subtext {
  opacity: 0.8;
  margin-top: 0.25rem;
  font-weight: 500;
}

.bento-item.size-xs .media-title { font-size: 0.75rem; }
.bento-item.size-xs .media-subtext { font-size: 0.625rem; }

.bento-item.size-sm .media-title { font-size: 0.875rem; }
.bento-item.size-sm .media-subtext { font-size: 0.75rem; }

.bento-item.size-md .media-title { font-size: 1.125rem; }
.bento-item.size-md .media-subtext { font-size: 0.875rem; }

.bento-item.size-lg .media-title { font-size: 1.25rem; }
.bento-item.size-lg .media-subtext { font-size: 1rem; }
`;
