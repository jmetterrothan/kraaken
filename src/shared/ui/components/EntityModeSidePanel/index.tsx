import React, { CSSProperties, memo, Suspense, useEffect, useState } from "react";
import cx from "classnames";
import SidePanel from "../SidePanel";
import "./EntityModeSidePanel.scss";
import { Animator, IAnimatorMetadata, Placeable, Sprite } from "@src/ECS/components";
import { IProjectBlueprint } from "@src/shared/models/world.model";
import type { IEditorStoreState } from "@src/states/EditorState/editorStore";
import editorStore from "@src/states/EditorState/editorStore";
import useTileset from "../ToolbarTileset/useTileset";
import { ISpriteData } from "@src/shared/models/sprite.model";
import { IAnimation } from "@src/shared/models/animation.model";

type EntityImageProps = {
  type: string;
  selected?: boolean;
  style?: CSSProperties;
  tileSet: ISpriteData;
  row?: number;
  col?: number;
};

const EntityImage = ({ type, row = 0, col = 0, selected = false, tileSet, ...props }: EntityImageProps) => {
  const { getTileAt } = useTileset(tileSet);

  const [loaded, setLoaded] = React.useState(false);
  const [failedLoading, setFailedLoading] = React.useState(false);

  const tile = getTileAt(row, col);

  if (!tile) {
    return null;
  }

  return (
    <img
      src={tile.subImage}
      width={tile.width * 4}
      height={tile.height * 4}
      onClick={() => {
        editorStore.setSelectedEntityType(selected ? null : type);
      }}
      className={cx("pixelated", loaded && "loaded", failedLoading && "failed")}
      onLoad={() => setLoaded(true)}
      onError={() => setFailedLoading(true)}
      {...props}
    />
  );
};

type AnimatedEntityImageProps = {
  type: string;
  animation: IAnimation;
  selected?: boolean;
  style?: CSSProperties;
  tileSet: ISpriteData;
};

const AnimatedEntityImage = ({ type, selected = false, animation, tileSet }: AnimatedEntityImageProps) => {
  const [keyframeIndex, setKeyframeIndex] = useState(0);

  const n = animation.keyframes.length;

  useEffect(() => {
    const id = setInterval(() => {
      setKeyframeIndex((b) => {
        let v = b + 1;
        if (v >= n) {
          v = 0;
        }
        return v;
      });
    }, 200);

    return () => {
      clearInterval(id);
    };
  }, [n]);

  return <EntityImage type={type} row={animation.keyframes[keyframeIndex].row} col={animation.keyframes[keyframeIndex].col} tileSet={tileSet} selected={selected} />;
};

type EntityModeSidePanelProps = {
  projectId: string;
  levelId: string;
  editorState: IEditorStoreState;
  blueprint: IProjectBlueprint;
};

const EntityModeSidePanel = ({ editorState, blueprint }: EntityModeSidePanelProps) => {
  const list = React.useMemo(() => {
    return blueprint.entities
      .filter((entity) => entity.components.find((component) => component.name === Placeable.COMPONENT_TYPE))
      .map((entity) => {
        const sprite = entity.components.find((c) => c.name === Sprite.COMPONENT_TYPE);
        const animator = entity.components.find((c) => c.name === Animator.COMPONENT_TYPE);
        const { list = {}, defaultKey } = ((animator?.metadata ?? {}) as unknown) as IAnimatorMetadata;

        const row = (sprite?.metadata?.row ?? 0) as number;
        const col = (sprite?.metadata?.col ?? 0) as number;

        const animation = defaultKey in list && list[defaultKey] ? list[defaultKey] : undefined;

        const tileSet: ISpriteData = blueprint.assets?.sprites?.find((s) => s.name === sprite?.metadata?.alias) ?? { name: "", src: "", tileWidth: 0, tileHeight: 0, defaultTileIndex: null };

        return {
          type: entity.type,
          animation,
          tileSet,
          row,
          col,
        };
      })
      .filter(({ tileSet }) => tileSet.src.length > 0);
  }, [blueprint.entities, blueprint.assets]);

  return (
    <SidePanel className="entity-mode-side-panel">
      <div className="entity-group">
        <SidePanel.Title>Entités</SidePanel.Title>
        <ul className="entity-group__list">
          {list.map(({ type, animation, tileSet, row, col }) => {
            return (
              <li key={type} title={type} data-type={type} data-row={row} data-col={col} className={cx(type === editorState.entityType && "active")}>
                <figure>
                  <Suspense>{animation ? <AnimatedEntityImage type={type} animation={animation} tileSet={tileSet} selected={type === editorState.entityType} /> : <EntityImage type={type} row={row} col={col} tileSet={tileSet} selected={type === editorState.entityType} />}</Suspense>
                  <figcaption>{type}</figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </SidePanel>
  );
};

export default memo(EntityModeSidePanel);
