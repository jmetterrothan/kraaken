import React, { PropsWithChildren } from "react";
import cx from "classnames";

import TileImage from "../TileImage";

import "./Modal.scss";

import useTileset from "../ToolbarTileset/useTileset";
import { ISpriteData } from "@src/shared/models/sprite.model";

interface Modal {
  isOpen?: boolean;
  open: () => void;
  close: () => void;
}

export const useModal = (): Modal => {
  const [isOpen, setOpen] = React.useState(false);

  return {
    isOpen,
    open: () => setOpen(true),
    close: () => setOpen(false),
  };
};

interface IModalProps {
  tileSet: ISpriteData;
  selected: number;
  isOpen?: boolean;
  onSelect?: (id: number) => void;
  onClose?: () => void;
}

const Modal = ({ selected, tileSet, isOpen, onSelect, onClose }: PropsWithChildren<IModalProps>) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const scale = 4;

  const { tiles, nbCols, nbRows } = useTileset(tileSet);

  React.useLayoutEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose?.();
      }
    };

    window.addEventListener("mousedown", fn);

    return () => {
      window.removeEventListener("mousedown", fn);
    };
  }, [ref]);

  return (
    <div className={cx("modal-container", isOpen && "active")}>
      <div ref={ref} className="modal">
        <ul
          className="modal-grid"
          style={{
            position: "relative", //
            width: `${nbCols * tileSet.tileWidth * scale}px`,
            height: `${nbRows * tileSet.tileHeight * scale}px`,
            backgroundSize: `${tileSet.tileWidth * scale}px ${tileSet.tileHeight * scale}px`,
          }}
        >
          {tiles.map(({ index, row, col, subImage }) => {
            const onClick = () => {
              onSelect?.(index);
              onClose?.();
            };

            return (
              <li
                key={index}
                className={cx("modal-grid__item", selected === index && "active")}
                style={{
                  position: "absolute", //
                  top: `${row * (tileSet.tileHeight * scale)}px`,
                  left: `${col * (tileSet.tileWidth * scale)}px`,
                }}
              >
                <TileImage
                  title={`row: ${row}, col: ${col}, index: ${index}`} //
                  src={subImage}
                  style={{
                    width: `${tileSet.tileWidth * scale}px`, //
                    height: `${tileSet.tileHeight * scale}px`,
                  }}
                  onClick={onClick}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Modal;
