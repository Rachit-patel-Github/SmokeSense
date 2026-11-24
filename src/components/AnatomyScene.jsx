import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const MODEL_SCALE = 0.025;
const MODEL_OFFSET_Y = -2.135;
const noRaycast = () => {};
const MODE_OPTIONS = [
  { id: "external", label: "Surface" },
  { id: "transparent", label: "X-ray" },
  { id: "internal", label: "Internal" },
];

function cloneModel(scene) {
  const model = scene.clone(true);
  model.traverse((object) => {
    if (!object.isMesh) return;
    object.material = Array.isArray(object.material)
      ? object.material.map((material) => material.clone())
      : object.material.clone();
    object.castShadow = true;
    object.receiveShadow = true;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      material.transparent = true;
      material.depthWrite = false;
      material.userData.baseColor = material.color?.clone();
      material.userData.targetColor = material.color?.clone();
      material.userData.targetEmissive = new THREE.Color("#000000");
      material.userData.targetEmissiveIntensity = 0;
    }
  });
  return model;
}

function organForMesh(mesh) {
  if (mesh.userData.organId) return mesh.userData.organId;
  const name = mesh.name.toLowerCase();
  if (/lung/.test(name)) return "lungs";
  if (/heart|ventricle|atrium|cardiac/.test(name)) return "heart";
  if (/brain|cerebr|cerebell|midbrain|medulla|pons/.test(name)) return "brain";
  if (/artery|vein|aorta|vascular/.test(name)) return "vessels";
  if (/liver/.test(name)) return "liver";
  if (/stomach/.test(name)) return "stomach";
  if (/kidney/.test(name)) return "kidneys";
  if (/trachea/.test(name)) return "trachea";
  if (/oral|mouth|lip|tongue|buccal/.test(name)) return "mouth";
  return null;
}

function getMeshes(model) {
  const meshes = [];
  model.traverse((object) => {
    if (object.isMesh) meshes.push(object);
  });
  return meshes;
}

function AnatomyAssets({ exposure, mode, selected, onSelect }) {
  const bodyAsset = useGLTF("/models/body-surface.glb");
  const organAsset = useGLTF("/models/internal-organs.glb");
  const body = useMemo(() => cloneModel(bodyAsset.scene), [bodyAsset.scene]);
  const organs = useMemo(() => cloneModel(organAsset.scene), [organAsset.scene]);
  const bodyMeshes = useMemo(() => getMeshes(body), [body]);
  const organMeshes = useMemo(() => getMeshes(organs), [organs]);
  const bodyOpacity = useRef(0);
  const organsOpacity = useRef(0);
  const lungWarning = useMemo(() => new THREE.Color("#3f252b"), []);
  const heartWarning = useMemo(() => new THREE.Color("#d28a55"), []);
  const vesselWarning = useMemo(() => new THREE.Color("#8f3940"), []);
  const brainWarning = useMemo(() => new THREE.Color("#8a5d79"), []);
  const highlightColor = useMemo(() => new THREE.Color("#5bcbd5"), []);

  useEffect(() => {
    organMeshes.forEach((object) => {
      if (!object.isMesh) return;
      const organ = organForMesh(object);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        const baseColor = material.userData.baseColor;
        if (!baseColor) continue;
        material.userData.targetColor = baseColor.clone();
        if (organ === "lungs") {
          material.userData.targetColor.lerp(lungWarning, exposure * 0.85);
        } else if (organ === "heart") {
          material.userData.targetColor.lerp(heartWarning, exposure * 0.48);
        } else if (organ === "vessels") {
          material.userData.targetColor.lerp(vesselWarning, exposure * 0.4);
        } else if (organ === "brain") {
          material.userData.targetColor.lerp(brainWarning, exposure * 0.25);
        }
        const selectedOrgan = selected === organ;
        material.userData.targetEmissive = selectedOrgan
          ? highlightColor
          : organ === "lungs" && exposure > 0.12
            ? new THREE.Color("#4b2632")
            : organ === "vessels" && exposure > 0.12
              ? new THREE.Color("#512b36")
            : new THREE.Color("#000000");
        material.userData.targetEmissiveIntensity = selectedOrgan
          ? 0.08
          : organ === "lungs" || organ === "vessels"
            ? exposure * 0.08
            : 0;
      }
    });
  }, [exposure, highlightColor, heartWarning, lungWarning, vesselWarning, brainWarning, organMeshes, selected]);

  useFrame((_, delta) => {
    const easing = 1 - Math.exp(-4.2 * delta);
    const nextBodyOpacity = mode === "external" ? 1 : mode === "transparent" ? 0.15 : 0.08;
    const nextOrgansOpacity = mode === "external" ? 0 : 1;
    bodyOpacity.current = THREE.MathUtils.lerp(bodyOpacity.current, nextBodyOpacity, easing);
    organsOpacity.current = THREE.MathUtils.lerp(organsOpacity.current, nextOrgansOpacity, easing);

    bodyMeshes.forEach((object) => {
      object.raycast = mode === "external" ? THREE.Mesh.prototype.raycast : noRaycast;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        material.opacity = bodyOpacity.current;
        const transparent = bodyOpacity.current < 0.999;
        if (material.transparent !== transparent) {
          material.transparent = transparent;
          material.depthWrite = !transparent;
          material.needsUpdate = true;
        }
      }
    });
    organMeshes.forEach((object) => {
      object.raycast = THREE.Mesh.prototype.raycast;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        material.opacity = organsOpacity.current;
        const transparent = organsOpacity.current < 0.999;
        if (material.transparent !== transparent) {
          material.transparent = transparent;
          material.depthWrite = !transparent;
          material.needsUpdate = true;
        }
        if (material.userData.targetColor) {
          material.color.lerp(material.userData.targetColor, easing);
        }
        if (material.userData.targetEmissive) {
          material.emissive.lerp(material.userData.targetEmissive, easing);
          material.emissiveIntensity = THREE.MathUtils.lerp(
            material.emissiveIntensity,
            material.userData.targetEmissiveIntensity || 0,
            easing,
          );
        }
      }
    });
  });

  const pick = (mesh) => (event) => {
    const organ = organForMesh(mesh);
    if (!organ) return;
    event.stopPropagation();
    onSelect(organ);
  };
  return (
    <group position={[0, MODEL_OFFSET_Y, 0]} scale={MODEL_SCALE}>
      <primitive object={body} visible />
      <primitive
        object={organs}
        visible={mode !== "external"}
        onClick={(event) => pick(event.object)(event)}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      />
    </group>
  );
}

function AnatomyLoading() {
  return (
    <Html center>
      <div className="scene-loading">Loading licensed anatomy atlas…</div>
    </Html>
  );
}

function ExposureBand({ exposure }) {
  const band = exposure < 0.04 ? "REFERENCE" : exposure < 0.34 ? "LOW" : exposure < 0.67 ? "MODERATE" : "HIGH";
  return (
    <div className="scene-exposure" aria-live="polite">
      <span className="exposure-indicator" />
      {band} VISUALIZATION
      <small>{Math.round(exposure * 100)}% intensity · illustrative only</small>
    </div>
  );
}

export default function AnatomyScene({ exposure, selected, onSelect }) {
  const [mode, setMode] = useState("transparent");

  return (
    <div className="anatomy-canvas">
      <Canvas
        camera={{ position: [0.35, 0.2, 7.3], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        shadows
      >
        <color attach="background" args={["#090f19"]} />
        <fog attach="fog" args={["#090f19", 9, 20]} />
        <ambientLight intensity={0.55} />
        <hemisphereLight intensity={1.35} color="#dcecf4" groundColor="#17121a" />
        <directionalLight position={[3.5, 5, 5]} intensity={3.2} color="#ffe1ce" castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, 2, 2]} intensity={2} color="#80d4dd" />
        <pointLight position={[2, -1.5, -3]} intensity={5} color="#b76d64" />
        <Suspense fallback={<AnatomyLoading />}>
          <AnatomyAssets exposure={exposure} mode={mode} selected={selected} onSelect={onSelect} />
        </Suspense>
        <ContactShadows position={[0, -2.13, 0]} opacity={0.3} scale={3.8} blur={2.2} far={2.5} color="#02050a" />
        <OrbitControls
          enableDamping
          enablePan
          minDistance={4.5}
          maxDistance={11}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI - 0.2}
          target={[0, 0, 0]}
        />
      </Canvas>
      <div className="scene-toolbar" role="group" aria-label="Anatomy view mode">
        {MODE_OPTIONS.map((option) => (
          <button
            key={option.id}
            className={mode === option.id ? "active" : ""}
            aria-pressed={mode === option.id}
            onClick={() => setMode(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <ExposureBand exposure={exposure} />
      <div className="canvas-instructions">Drag to rotate <span>·</span> Scroll to zoom <span>·</span> Right-drag to pan <span>·</span> Select an organ</div>
    </div>
  );
}
