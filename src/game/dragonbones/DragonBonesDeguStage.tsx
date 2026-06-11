import { useEffect, useRef, useState } from 'react';
import type { Application, Texture } from 'pixi.js';
import type { PixiArmatureDisplay, PixiFactory } from 'pixi-dragonbones-runtime';
import {
  DEGU_RIG_ATLAS,
  DEGU_RIG_ARMATURE,
  DEGU_RIG_NAME,
  DEGU_RIG_SKELETON,
  DEGU_RIG_TEXTURE,
  dragonBonesOutfitSlots
} from './deguRigData';

interface DragonBonesDeguStageProps {
  selectedOutfitIds: string[];
}

async function fetchRigJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load DragonBones asset ${url}: ${response.status}`);
  }

  return response.json() as Promise<object>;
}

function ensureRigData(
  factory: PixiFactory,
  texture: Texture,
  dragonBonesData: object,
  textureAtlasData: object
) {
  if (!factory.getDragonBonesData(DEGU_RIG_NAME)) {
    factory.parseDragonBonesData(dragonBonesData, DEGU_RIG_NAME);
  }

  if (!factory.getTextureAtlasData(DEGU_RIG_NAME)) {
    factory.parseTextureAtlasData(textureAtlasData, texture, DEGU_RIG_NAME);
  }
}

function applyWardrobeSlots(armatureDisplay: PixiArmatureDisplay | null, selectedOutfitIds: string[]) {
  if (!armatureDisplay) return;

  const rigSlotNames = new Set(
    Object.values(dragonBonesOutfitSlots).flatMap((outfitAttachments) =>
      outfitAttachments.map((attachment) => attachment.slotName)
    )
  );

  rigSlotNames.forEach((slotName) => {
    const slot = armatureDisplay.armature.getSlot(slotName);
    if (slot) slot.displayIndex = -1;
  });

  selectedOutfitIds.forEach((outfitId) => {
    const outfitAttachments = dragonBonesOutfitSlots[outfitId as keyof typeof dragonBonesOutfitSlots];
    if (!outfitAttachments) return;

    outfitAttachments.forEach((attachment) => {
      const slot = armatureDisplay.armature.getSlot(attachment.slotName);
      if (slot) slot.displayIndex = attachment.displayIndex;
    });
  });
}

export function DragonBonesDeguStage({ selectedOutfitIds }: DragonBonesDeguStageProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const armatureRef = useRef<PixiArmatureDisplay | null>(null);
  const restartIdleTimer = useRef<number | null>(null);
  const selectedOutfitIdsRef = useRef(selectedOutfitIds);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let disposed = false;
    let app: Application | null = null;
    let armatureDisplay: PixiArmatureDisplay | null = null;
    let advanceDragonBones: ((seconds: number) => void) | null = null;

    async function mountRig() {
      const host = mountRef.current;
      if (!host) return;

      try {
        const [{ Application, Assets, Container }, { PixiFactory }] = await Promise.all([
          import('pixi.js'),
          import('pixi-dragonbones-runtime')
        ]);

        app = new Application();
        await app.init({
          width: 310,
          height: 310,
          backgroundAlpha: 0,
          antialias: false,
          autoDensity: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2)
        });

        if (disposed) {
          app.destroy(true);
          return;
        }

        host.replaceChildren(app.canvas);
        app.canvas.className = 'dragonbones-canvas';
        app.canvas.setAttribute('aria-hidden', 'true');

        PixiFactory.useSharedTicker = false;
        const factory = PixiFactory.newInstance(false);
        advanceDragonBones = PixiFactory.advanceTime.bind(PixiFactory);
        const [texture, dragonBonesData, textureAtlasData] = await Promise.all([
          Assets.load<Texture>(DEGU_RIG_TEXTURE),
          fetchRigJson(DEGU_RIG_SKELETON),
          fetchRigJson(DEGU_RIG_ATLAS)
        ]);

        if (disposed) {
          app.destroy(true);
          return;
        }

        ensureRigData(factory, texture, dragonBonesData, textureAtlasData);
        armatureDisplay = factory.buildArmatureDisplay(DEGU_RIG_ARMATURE, DEGU_RIG_NAME, '', DEGU_RIG_NAME);

        if (!armatureDisplay) {
          setStatus('DragonBones build failed');
          return;
        }

        armatureRef.current = armatureDisplay;
        armatureDisplay.x = 152;
        armatureDisplay.y = 205;
        armatureDisplay.scale.set(0.48);
        armatureDisplay.eventMode = 'static';
        armatureDisplay.cursor = 'pointer';
        armatureDisplay.on('pointertap', () => {
          armatureDisplay?.animation.play('tap-happy', 1);
          if (restartIdleTimer.current) window.clearTimeout(restartIdleTimer.current);
          restartIdleTimer.current = window.setTimeout(() => {
            armatureDisplay?.animation.play('idle', 0);
          }, 760);
        });

        const rigLayer = new Container();
        rigLayer.addChild(armatureDisplay);
        app.stage.addChild(rigLayer);
        app.ticker.add((ticker) => advanceDragonBones?.(ticker.deltaMS / 1000));
        armatureDisplay.animation.play('idle', 0);
        applyWardrobeSlots(armatureDisplay, selectedOutfitIdsRef.current);
        setStatus('ready');
      } catch (error) {
        console.error(error);
        setStatus('DragonBones load failed');
      }
    }

    void mountRig();

    return () => {
      disposed = true;
      if (restartIdleTimer.current) {
        window.clearTimeout(restartIdleTimer.current);
        restartIdleTimer.current = null;
      }
      armatureRef.current = null;
      if (armatureDisplay) {
        armatureDisplay.parent?.removeChild(armatureDisplay);
        armatureDisplay.destroy();
        advanceDragonBones?.(0);
      }
      app?.destroy(true);
    };
  }, []);

  useEffect(() => {
    selectedOutfitIdsRef.current = selectedOutfitIds;
    applyWardrobeSlots(armatureRef.current, selectedOutfitIds);
  }, [selectedOutfitIds]);

  return (
    <section className="dragonbones-rig-card" aria-label="Degu wardrobe preview">
      <div className="dragonbones-stage" ref={mountRef} data-status={status} />
      <span className="sr-only" role="status">
        Degu wardrobe preview {status}
      </span>
    </section>
  );
}
