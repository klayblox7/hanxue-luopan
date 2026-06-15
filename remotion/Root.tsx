import { Composition } from "remotion";

import { KoreaLinkFilm } from "./KoreaLinkFilm";
import { KoreaLinkShortCn } from "./KoreaLinkShortCn";
import type { FilmFormat } from "./film-data";
import { FILM_FPS, SHORT_CN_DURATION_FRAMES, WIDE_DURATION_FRAMES, VERTICAL_DURATION_FRAMES } from "./film-data";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="KoreaLinkShortCn9x16"
        component={KoreaLinkShortCn}
        durationInFrames={SHORT_CN_DURATION_FRAMES}
        fps={FILM_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="KoreaLinkFilm16x9"
        component={KoreaLinkFilm}
        durationInFrames={WIDE_DURATION_FRAMES}
        fps={FILM_FPS}
        width={1920}
        height={1080}
        defaultProps={{ format: "wide" satisfies FilmFormat }}
      />
      <Composition
        id="KoreaLinkFilm9x16"
        component={KoreaLinkFilm}
        durationInFrames={VERTICAL_DURATION_FRAMES}
        fps={FILM_FPS}
        width={1080}
        height={1920}
        defaultProps={{ format: "vertical" satisfies FilmFormat }}
      />
    </>
  );
};
