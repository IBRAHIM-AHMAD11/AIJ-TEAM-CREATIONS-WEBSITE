"use client";

import { useState, useMemo } from "react";
import {
  Choicebox,
  ChoiceboxItem,
  ChoiceboxItemTitle,
} from "@/components/ui/choicebox";

// ─── RESIN-APPROPRIATE COLOR LIBRARY ─────────────────────────────
const COLOR_CATEGORIES = [
  {
    name: "Clear & Transparent",
    colors: [
      { name: "Crystal Clear", hex: "#f8f9fa" },
      { name: "Transparent", hex: "#e9ecef" },
      { name: "Frosted", hex: "#dee2e6" },
      { name: "Translucent White", hex: "#f1f3f5" },
    ],
  },
  {
    name: "Metallics",
    colors: [
      { name: "Gold", hex: "#d4a017" },
      { name: "Silver", hex: "#c0c0c0" },
      { name: "Copper", hex: "#b87333" },
      { name: "Bronze", hex: "#cd7f32" },
      { name: "Rose Gold", hex: "#b76e79" },
      { name: "Champagne", hex: "#f7e7ce" },
    ],
  },
  {
    name: "Pearlescent",
    colors: [
      { name: "Pearl White", hex: "#f5f0e8" },
      { name: "Opal", hex: "#c3d7e6" },
      { name: "Mother of Pearl", hex: "#e8d5c4" },
      { name: "Iridescent", hex: "#d4c5e0" },
    ],
  },
  {
    name: "Opaque",
    colors: [
      { name: "Jet Black", hex: "#0a0a0a" },
      { name: "Pure White", hex: "#ffffff" },
      { name: "Navy Blue", hex: "#1b2a4a" },
      { name: "Crimson Red", hex: "#8b0000" },
      { name: "Emerald Green", hex: "#046307" },
      { name: "Sapphire Blue", hex: "#0f52ba" },
      { name: "Amethyst Purple", hex: "#7b2d8b" },
    ],
  },
  {
    name: "Glow & Neon",
    colors: [
      { name: "Neon Pink", hex: "#ff1493" },
      { name: "Neon Green", hex: "#39ff14" },
      { name: "Glow in the Dark", hex: "#d4e8a0" },
      { name: "UV Reactive Blue", hex: "#4d4dff" },
      { name: "UV Reactive Orange", hex: "#ff7300" },
    ],
  },
  {
    name: "Earth Tones",
    colors: [
      { name: "Amber", hex: "#ffbf00" },
      { name: "Honey", hex: "#ec9706" },
      { name: "Teal", hex: "#008080" },
      { name: "Forest Green", hex: "#228b22" },
      { name: "Terracotta", hex: "#cc4e2b" },
      { name: "Sand", hex: "#c2b280" },
      { name: "Slate Gray", hex: "#708090" },
    ],
  },
];

const SIZE_LIBRARY = [
  "XS", "S", "M", "L", "XL", "XXL", "One Size",
  "Mini", "Standard", "Jumbo",
  "2 oz", "4 oz", "8 oz", "16 oz",
];

const MATERIAL_LIBRARY = [
  "Epoxy Resin", "UV Resin", "Polyester Resin", "Casting Resin",
  "Coating Resin", "Art Resin", "Jewelry Resin",
  "Wood + Epoxy", "Metal + Epoxy", "Concrete + Resin",
  "Silicone Mold", "Alumilite", "Liquid Glass", "EnviroTex",
  "Biodegradable Resin", "Industrial Resin",
];

const FINISH_LIBRARY = [
  "Glossy", "High-Gloss", "Semi-Gloss", "Satin", "Matte",
  "Textured", "Polished", "Brushed", "Hammered", "Sandblasted",
];

type FeatureType = "color" | "size" | "material" | "dimension" | "finish" | "custom";

// ─── INTERFACE ───────────────────────────────────────────────────
interface FeatureSelectionModalProps {
  onClose: (open: boolean) => void;
  onSave: (data: {
    type: FeatureType;
    label: string;
    value: string;
    unit?: string;
    priceAdjustment?: number;
  }) => void;
  basePriceDollars?: string;
}

// ─── COMPONENT ───────────────────────────────────────────────────
export function FeatureSelectionModal({ onClose, onSave, basePriceDollars }: FeatureSelectionModalProps) {
  const [activeTab, setActiveTab] = useState<FeatureType>("color");
  const [colorSearch, setColorSearch] = useState("");

  // Color state
  const [selectedColorHex, setSelectedColorHex] = useState<string>("");
  const [selectedColorName, setSelectedColorName] = useState<string>("");
  const [showOtherColor, setShowOtherColor] = useState(false);
  const [otherColorHex, setOtherColorHex] = useState("#94a3b8");
  const [otherColorName, setOtherColorName] = useState("");

  // Size state
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [showOtherSize, setShowOtherSize] = useState(false);
  const [otherSizeValue, setOtherSizeValue] = useState("");

  // Dimension state
  const [dimWidth, setDimWidth] = useState("");
  const [dimHeight, setDimHeight] = useState("");
  const [dimDepth, setDimDepth] = useState("");
  const [dimLabel, setDimLabel] = useState("");
  const [dimUnit, setDimUnit] = useState<"cm" | "inches">("cm");

  // Material state
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [showOtherMaterial, setShowOtherMaterial] = useState(false);
  const [otherMaterialValue, setOtherMaterialValue] = useState("");

  // Finish state
  const [selectedFinish, setSelectedFinish] = useState("");
  const [showOtherFinish, setShowOtherFinish] = useState(false);
  const [otherFinishValue, setOtherFinishValue] = useState("");

  // Custom state
  const [customType, setCustomType] = useState<FeatureType>("custom");
  const [customLabel, setCustomLabel] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [customColor, setCustomColor] = useState("#94a3b8");

  // Price adjustment
  const [priceAdjustmentDollars, setPriceAdjustmentDollars] = useState("0");

  // ── Color helpers ──
  const allColors = useMemo(
    () => COLOR_CATEGORIES.flatMap((cat) => cat.colors),
    []
  );

  const filteredColors = useMemo(() => {
    if (!colorSearch.trim()) return null;
    const q = colorSearch.toLowerCase();
    return allColors.filter(
      (col) =>
        col.name.toLowerCase().includes(q) ||
        col.hex.toLowerCase().includes(q)
    );
  }, [colorSearch, allColors]);

  const handleColorSelection = (hex: string) => {
    if (hex === "__other__") {
      setShowOtherColor(true);
      setSelectedColorHex("");
      return;
    }
    setShowOtherColor(false);
    setSelectedColorHex(hex);
    const matched = allColors.find((c) => c.hex === hex);
    if (matched) setSelectedColorName(matched.name);
  };

  const handleConfirmOtherColor = () => {
    const name = otherColorName.trim() || "Custom Color";
    setSelectedColorHex(otherColorHex);
    setSelectedColorName(name);
    setShowOtherColor(false);
  };

  // ── Size helpers ──
  const handleSelectSize = (sz: string) => {
    setShowOtherSize(false);
    setSelectedSize(sz);
    setOtherSizeValue("");
  };

  const handleConfirmOtherSize = () => {
    const val = otherSizeValue.trim();
    if (val) {
      setSelectedSize(val);
      setShowOtherSize(false);
    }
  };

  // ── Dimension helpers ──
  const dimensionPreview = useMemo(() => {
    const parts: string[] = [];
    if (dimWidth) parts.push(`${dimWidth}${dimUnit}`);
    if (dimHeight) parts.push(`${dimHeight}${dimUnit}`);
    if (dimDepth) parts.push(`${dimDepth}${dimUnit}`);
    return parts.length ? parts.join(" × ") : "";
  }, [dimWidth, dimHeight, dimDepth, dimUnit]);

  // ── Material helpers ──
  const handleSelectMaterial = (mat: string) => {
    setShowOtherMaterial(false);
    setSelectedMaterial(mat);
    setOtherMaterialValue("");
  };

  const handleConfirmOtherMaterial = () => {
    const val = otherMaterialValue.trim();
    if (val) {
      setSelectedMaterial(val);
      setShowOtherMaterial(false);
    }
  };

  // ── Finish helpers ──
  const handleSelectFinish = (fin: string) => {
    setShowOtherFinish(false);
    setSelectedFinish(fin);
    setOtherFinishValue("");
  };

  const handleConfirmOtherFinish = () => {
    const val = otherFinishValue.trim();
    if (val) {
      setSelectedFinish(val);
      setShowOtherFinish(false);
    }
  };

  // ── Validation ──
  const canSubmit = useMemo(() => {
    switch (activeTab) {
      case "color":
        if (showOtherColor) return otherColorName.trim().length > 0;
        return selectedColorHex !== "";
      case "size":
        if (showOtherSize) return otherSizeValue.trim().length > 0;
        return selectedSize !== "";
      case "dimension":
        return dimWidth !== "" && dimHeight !== "";
      case "material":
        if (showOtherMaterial) return otherMaterialValue.trim().length > 0;
        return selectedMaterial !== "";
      case "finish":
        if (showOtherFinish) return otherFinishValue.trim().length > 0;
        return selectedFinish !== "";
      case "custom":
        return customLabel.trim() !== "" && customValue.trim() !== "";
      default:
        return false;
    }
  }, [
    activeTab,
    showOtherColor,
    otherColorName,
    selectedColorHex,
    showOtherSize,
    otherSizeValue,
    selectedSize,
    dimWidth,
    dimHeight,
    showOtherMaterial,
    otherMaterialValue,
    selectedMaterial,
    showOtherFinish,
    otherFinishValue,
    selectedFinish,
    customLabel,
    customValue,
  ]);

  // ── Submit ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const adj = parseFloat(priceAdjustmentDollars) || 0;
    const priceAdjustment = adj !== 0 ? Math.round(adj * 100) : undefined;

    switch (activeTab) {
      case "color": {
        if (showOtherColor && otherColorName.trim()) {
          onSave({ type: "color", label: otherColorName.trim(), value: otherColorHex, priceAdjustment });
        } else if (selectedColorHex) {
          onSave({ type: "color", label: selectedColorName, value: selectedColorHex, priceAdjustment });
        }
        break;
      }
      case "size": {
        const sizeVal = showOtherSize && otherSizeValue.trim() ? otherSizeValue.trim() : selectedSize;
        onSave({ type: "size", label: "Size", value: sizeVal, priceAdjustment });
        break;
      }
      case "dimension": {
        const dims = [dimWidth, dimHeight, dimDepth].filter(Boolean).join("x");
        const label = dimLabel.trim() || "Dimensions";
        onSave({
          type: "dimension",
          label,
          value: dims,
          unit: dimUnit,
          priceAdjustment,
        });
        break;
      }
      case "material": {
        const matVal =
          showOtherMaterial && otherMaterialValue.trim() ? otherMaterialValue.trim() : selectedMaterial;
        onSave({ type: "material", label: "Material", value: matVal, priceAdjustment });
        break;
      }
      case "finish": {
        const finVal =
          showOtherFinish && otherFinishValue.trim() ? otherFinishValue.trim() : selectedFinish;
        onSave({ type: "finish", label: "Finish", value: finVal, priceAdjustment });
        break;
      }
      case "custom": {
        if (customType === "color") {
          onSave({ type: "color", label: customLabel.trim(), value: customValue, priceAdjustment });
        } else {
          onSave({ type: customType, label: customLabel.trim(), value: customValue.trim(), priceAdjustment });
        }
        break;
      }
    }

    onClose(false);
  };

  // ── Tabs ──
  const tabs: { key: FeatureType; label: string }[] = [
    { key: "color", label: "Color" },
    { key: "size", label: "Size" },
    { key: "dimension", label: "Dimensions" },
    { key: "material", label: "Material" },
    { key: "finish", label: "Finish" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Add Product Feature</h3>
          <p className="text-xs text-gray-500">
            Select or define a product attribute.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-6 gap-1 p-1 bg-gray-100 rounded-lg mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-950"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Forms */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[300px] max-h-[450px]"
        >
          {/* ──── TAB: COLOR ──── */}
          {activeTab === "color" && (
            <div className="space-y-3">
              <input
                type="text"
                value={colorSearch}
                onChange={(e) => setColorSearch(e.target.value)}
                placeholder="Search colors..."
                className="w-full text-sm bg-gray-50 border rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              {filteredColors !== null ? (
                /* search results */
                <Choicebox
                  value={selectedColorHex}
                  onValueChange={handleColorSelection}
                  className="grid grid-cols-2 gap-2"
                >
                  {filteredColors.map((col) => (
                    <ChoiceboxItem key={col.hex} value={col.hex} className="p-2.5">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-6 h-6 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: col.hex }}
                        />
                        <ChoiceboxItemTitle className="font-semibold text-gray-800">
                          {col.name}
                        </ChoiceboxItemTitle>
                      </div>
                    </ChoiceboxItem>
                  ))}
                  <ChoiceboxItem value="__other__" className="p-2.5 col-span-2">
                    <span className="text-xs font-semibold text-blue-600">
                      Other color…
                    </span>
                  </ChoiceboxItem>
                </Choicebox>
              ) : (
                /* browse by category */
                <div className="space-y-4">
                  {COLOR_CATEGORIES.map((cat) => (
                    <div key={cat.name}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                        {cat.name}
                      </p>
                      <Choicebox
                        value={selectedColorHex}
                        onValueChange={handleColorSelection}
                        className="grid grid-cols-2 gap-1.5"
                      >
                        {cat.colors.map((col) => (
                          <ChoiceboxItem key={col.hex} value={col.hex} className="p-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: col.hex }}
                              />
                              <ChoiceboxItemTitle className="text-[11px] font-semibold text-gray-800">
                                {col.name}
                              </ChoiceboxItemTitle>
                            </div>
                          </ChoiceboxItem>
                        ))}
                      </Choicebox>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtherColor(true);
                      setSelectedColorHex("");
                    }}
                    className="w-full text-xs font-semibold text-blue-600 border border-dashed border-blue-300 rounded-md py-2 hover:bg-blue-50 transition"
                  >
                    + Add custom color
                  </button>
                </div>
              )}

              {showOtherColor && (
                <div className="p-3 border rounded-md bg-gray-50 space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Custom Color</p>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={otherColorHex}
                      onChange={(e) => setOtherColorHex(e.target.value)}
                      className="w-12 h-10 cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={otherColorName}
                      onChange={(e) => setOtherColorName(e.target.value)}
                      placeholder="Color name"
                      className="flex-1 text-sm border rounded-md px-3 py-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmOtherColor}
                    className="text-xs font-semibold text-white bg-blue-600 rounded-md px-3 py-1.5 hover:bg-blue-700"
                  >
                    Use this color
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ──── TAB: SIZE ──── */}
          {activeTab === "size" && (
            <div className="space-y-3">
              {!showOtherSize ? (
                <>
                  <Choicebox
                    value={selectedSize}
                    onValueChange={handleSelectSize}
                    className="grid grid-cols-3 gap-2"
                  >
                    {SIZE_LIBRARY.map((sz) => (
                      <ChoiceboxItem key={sz} value={sz} className="py-3 flex justify-center">
                        <ChoiceboxItemTitle className="font-bold text-sm">{sz}</ChoiceboxItemTitle>
                      </ChoiceboxItem>
                    ))}
                  </Choicebox>
                  <button
                    type="button"
                    onClick={() => setShowOtherSize(true)}
                    className="w-full text-xs font-semibold text-blue-600 border border-dashed border-blue-300 rounded-md py-2 hover:bg-blue-50 transition"
                  >
                    + Custom size
                  </button>
                </>
              ) : (
                <div className="p-3 border rounded-md bg-gray-50 space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Custom Size</p>
                  <input
                    type="text"
                    value={otherSizeValue}
                    onChange={(e) => setOtherSizeValue(e.target.value)}
                    placeholder="e.g. 5×7 inches, A4, 500ml"
                    className="w-full text-sm border rounded-md px-3 py-2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleConfirmOtherSize}
                      className="text-xs font-semibold text-white bg-blue-600 rounded-md px-3 py-1.5 hover:bg-blue-700"
                    >
                      Use this size
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOtherSize(false);
                        setOtherSizeValue("");
                      }}
                      className="text-xs font-semibold text-gray-600 border rounded-md px-3 py-1.5"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──── TAB: DIMENSIONS ──── */}
          {activeTab === "dimension" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {(["cm", "inches"] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setDimUnit(unit)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition ${
                      dimUnit === unit
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {unit === "cm" ? "cm" : "inches"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-gray-500 mb-1">
                    Width
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={dimWidth}
                      onChange={(e) => setDimWidth(e.target.value)}
                      placeholder="0"
                      className="w-full text-sm border rounded-md px-3 py-2 pr-8"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {dimUnit}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-gray-500 mb-1">
                    Height
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={dimHeight}
                      onChange={(e) => setDimHeight(e.target.value)}
                      placeholder="0"
                      className="w-full text-sm border rounded-md px-3 py-2 pr-8"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {dimUnit}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-gray-500 mb-1">
                    Depth <span className="font-normal lowercase text-gray-400">opt.</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={dimDepth}
                      onChange={(e) => setDimDepth(e.target.value)}
                      placeholder="-"
                      className="w-full text-sm border rounded-md px-3 py-2 pr-8"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {dimUnit}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase text-gray-500 mb-1">
                  Label <span className="font-normal lowercase text-gray-400">opt.</span>
                </label>
                <input
                  type="text"
                  value={dimLabel}
                  onChange={(e) => setDimLabel(e.target.value)}
                  placeholder="e.g. Coaster size, Art panel"
                  className="w-full text-sm border rounded-md px-3 py-2"
                />
              </div>

              {dimensionPreview && (
                <div className="p-3 bg-gray-50 border rounded-md text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Preview
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {dimLabel ? `${dimLabel}: ` : ""}
                    {dimensionPreview}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ──── TAB: MATERIAL ──── */}
          {activeTab === "material" && (
            <div className="space-y-3">
              {!showOtherMaterial ? (
                <>
                  <Choicebox
                    value={selectedMaterial}
                    onValueChange={handleSelectMaterial}
                    className="grid grid-cols-2 gap-2"
                  >
                    {MATERIAL_LIBRARY.map((mat) => (
                      <ChoiceboxItem key={mat} value={mat} className="py-3 px-3">
                        <ChoiceboxItemTitle className="text-xs font-semibold">
                          {mat}
                        </ChoiceboxItemTitle>
                      </ChoiceboxItem>
                    ))}
                  </Choicebox>
                  <button
                    type="button"
                    onClick={() => setShowOtherMaterial(true)}
                    className="w-full text-xs font-semibold text-blue-600 border border-dashed border-blue-300 rounded-md py-2 hover:bg-blue-50 transition"
                  >
                    + Other material
                  </button>
                </>
              ) : (
                <div className="p-3 border rounded-md bg-gray-50 space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Custom Material</p>
                  <input
                    type="text"
                    value={otherMaterialValue}
                    onChange={(e) => setOtherMaterialValue(e.target.value)}
                    placeholder="e.g. Crushed Glass + Resin"
                    className="w-full text-sm border rounded-md px-3 py-2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleConfirmOtherMaterial}
                      className="text-xs font-semibold text-white bg-blue-600 rounded-md px-3 py-1.5 hover:bg-blue-700"
                    >
                      Use this material
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOtherMaterial(false);
                        setOtherMaterialValue("");
                      }}
                      className="text-xs font-semibold text-gray-600 border rounded-md px-3 py-1.5"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──── TAB: FINISH ──── */}
          {activeTab === "finish" && (
            <div className="space-y-3">
              {!showOtherFinish ? (
                <>
                  <Choicebox
                    value={selectedFinish}
                    onValueChange={handleSelectFinish}
                    className="grid grid-cols-2 gap-2"
                  >
                    {FINISH_LIBRARY.map((fin) => (
                      <ChoiceboxItem key={fin} value={fin} className="py-3 px-3">
                        <ChoiceboxItemTitle className="text-xs font-semibold">
                          {fin}
                        </ChoiceboxItemTitle>
                      </ChoiceboxItem>
                    ))}
                  </Choicebox>
                  <button
                    type="button"
                    onClick={() => setShowOtherFinish(true)}
                    className="w-full text-xs font-semibold text-blue-600 border border-dashed border-blue-300 rounded-md py-2 hover:bg-blue-50 transition"
                  >
                    + Other finish
                  </button>
                </>
              ) : (
                <div className="p-3 border rounded-md bg-gray-50 space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Custom Finish</p>
                  <input
                    type="text"
                    value={otherFinishValue}
                    onChange={(e) => setOtherFinishValue(e.target.value)}
                    placeholder="e.g. Glitter top coat"
                    className="w-full text-sm border rounded-md px-3 py-2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleConfirmOtherFinish}
                      className="text-xs font-semibold text-white bg-blue-600 rounded-md px-3 py-1.5 hover:bg-blue-700"
                    >
                      Use this finish
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOtherFinish(false);
                        setOtherFinishValue("");
                      }}
                      className="text-xs font-semibold text-gray-600 border rounded-md px-3 py-1.5"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──── TAB: CUSTOM ──── */}
          {activeTab === "custom" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Create your own attribute — choose the type and fill in the details.
              </p>

              <div>
                <label className="block text-[10px] font-semibold uppercase text-gray-500 mb-1">
                  Attribute Type
                </label>
                <select
                  value={customType}
                  onChange={(e) => {
                    setCustomType(e.target.value as FeatureType);
                    setCustomLabel("");
                    setCustomValue("");
                  }}
                  className="w-full text-sm border rounded-md px-3 py-2 bg-white text-gray-800"
                >
                  <option value="color">Color</option>
                  <option value="size">Size</option>
                  <option value="dimension">Dimension</option>
                  <option value="material">Material</option>
                  <option value="finish">Finish</option>
                  <option value="custom">Generic / Text</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase text-gray-500 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  required
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder={
                    customType === "color"
                      ? "e.g. Ocean Blue"
                      : customType === "size"
                      ? "e.g. A4, 500ml"
                      : customType === "dimension"
                      ? "e.g. Panel size"
                      : customType === "material"
                      ? "e.g. Crushed Glass"
                      : customType === "finish"
                      ? "e.g. Top Coat"
                      : "e.g. Feature name"
                  }
                  className="w-full text-sm border rounded-md px-3 py-2"
                />
              </div>

              {customType === "color" ? (
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-gray-500 mb-1">
                    Color Value
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={customValue || customColor}
                      onChange={(e) => {
                        setCustomValue(e.target.value);
                        setCustomColor(e.target.value);
                      }}
                      className="w-12 h-10 cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      placeholder="#hex or color code"
                      className="flex-1 text-sm border rounded-md px-3 py-2 font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-gray-500 mb-1">
                    Value
                  </label>
                  <input
                    type="text"
                    required
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder={
                      customType === "size"
                        ? "e.g. 10×15 cm"
                        : customType === "dimension"
                        ? "e.g. 20x30x5"
                        : customType === "material"
                        ? "e.g. Epoxy Resin"
                        : customType === "finish"
                        ? "e.g. High-Gloss"
                        : "e.g. Value text"
                    }
                    className="w-full text-sm border rounded-md px-3 py-2"
                  />
                </div>
              )}
            </div>
          )}

          {/* ──── Shared: Price Adjustment ──── */}
          {canSubmit && (
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-[10px] font-semibold uppercase text-gray-500 mb-1">
                Price adjustment <span className="font-normal lowercase text-gray-400">optional</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={priceAdjustmentDollars}
                  onChange={(e) => setPriceAdjustmentDollars(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-sm border rounded-md pl-7 pr-3 py-2"
                />
              </div>
              {(() => {
                const base = parseFloat(basePriceDollars || "0");
                const adj = parseFloat(priceAdjustmentDollars) || 0;
                const effective = base + adj;
                if (base > 0 && adj !== 0) {
                  return (
                    <p className={`text-[10px] mt-0.5 ${effective <= 0 ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                      Effective price: ${effective.toFixed(2)} {effective <= 0 ? "⚠️ Total would be zero or negative" : ""}
                    </p>
                  );
                }
                return (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Added to (or subtracted from) the base price when this option is selected.
                  </p>
                );
              })()}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-2 text-sm pt-4 border-t mt-4">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-4 py-2 border rounded-md text-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-md hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Feature
          </button>
        </div>
      </div>
    </div>
  );
}