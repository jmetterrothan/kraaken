import React from "react";
import cx from "classnames";

import TileImage from "../TileImage";

import "./Modal.scss";

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
  tiles: any;
  selected: number;
  nbCols: number;
  nbRows: number;
  tileWidth: number;
  tileHeight: number;
  isOpen?: boolean;
  onSelect?: (id: number) => void;
  onClose?: () => void;
}

const Modal: React.FC<IModalProps> = ({ tiles, selected, nbCols, nbRows, tileWidth, tileHeight, isOpen, onSelect, onClose }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const scale = 4;

  React.useLayoutEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
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
            width: `${nbCols * tileWidth * scale}px`,
            height: `${nbRows * tileHeight * scale}px`,
            backgroundSize: `${tileWidth * scale}px ${tileHeight * scale}px`,
          }}
        >
          {tiles.map(({ index, row, col, subImage }) => {
            const onClick = () => {
              onSelect(index);
              onClose();
            };

            return (
              <li
                key={index}
                className={cx("modal-grid__item", selected === index && "active")}
                style={{
                  position: "absolute", //
                  top: `${row * (tileHeight * scale)}px`,
                  left: `${col * (tileWidth * scale)}px`,
                }}
              >
                <TileImage
                  title={`row: ${row}, col: ${col}, index: ${index}`} //
                  src={subImage}
                  style={{
                    width: `${tileWidth * scale}px`, //
                    height: `${tileHeight * scale}px`,
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
