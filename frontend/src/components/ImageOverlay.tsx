import { gradients } from "../design-tokens";

interface ImageOverlayProps {
  fullCover?: boolean;
}

export const ImageOverlay = ({
  fullCover = false,
}: ImageOverlayProps) => {
  return (
    <>
      {/* Purple gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: gradients.imagePurpleOverlay,
          mixBlendMode: fullCover ? "normal" : "soft-light",
        }}
      />

      {/* Bottom readability fade */}
      <div
        className="absolute inset-0"
        style={{
          background: gradients.imageBottomFade,
        }}
      />
    </>
  );
};