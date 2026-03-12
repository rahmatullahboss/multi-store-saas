(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/ai-builder/components/ImageUpload.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ImageUpload",
    ()=>ImageUpload
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/ai-builder/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/ai-builder/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function ImageUpload({ images, onImagesChange, maxImages = 2 }) {
    _s();
    const [isDragging, setIsDragging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const handleFileChange = async (files)=>{
        if (!files) return;
        const newImages = [
            ...images
        ];
        for(let i = 0; i < files.length && newImages.length < maxImages; i++){
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;
            // Convert to base64
            const base64 = await fileToBase64(file);
            newImages.push(base64);
        }
        onImagesChange(newImages);
    };
    const fileToBase64 = (file)=>{
        return new Promise((resolve, reject)=>{
            const reader = new FileReader();
            reader.onload = ()=>resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };
    const removeImage = (index)=>{
        onImagesChange(images.filter((_, i)=>i !== index));
    };
    const handleDrop = (e)=>{
        e.preventDefault();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };
    const handleDragOver = (e)=>{
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = ()=>{
        setIsDragging(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block text-sm font-medium text-gray-300",
                children: "Reference Images (Optional)"
            }, void 0, false, {
                fileName: "[project]/apps/ai-builder/components/ImageUpload.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            images.length < maxImages && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: ()=>inputRef.current?.click(),
                onDrop: handleDrop,
                onDragOver: handleDragOver,
                onDragLeave: handleDragLeave,
                className: `
            border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
            ${isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700 hover:border-gray-600 hover:bg-white/5'}
          `,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ref: inputRef,
                        type: "file",
                        accept: "image/*",
                        multiple: true,
                        onChange: (e)=>handleFileChange(e.target.files),
                        className: "hidden"
                    }, void 0, false, {
                        fileName: "[project]/apps/ai-builder/components/ImageUpload.tsx",
                        lineNumber: 82,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 rounded-full bg-gray-800",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                    className: "w-5 h-5 text-gray-400"
                                }, void 0, false, {
                                    fileName: "[project]/apps/ai-builder/components/ImageUpload.tsx",
                                    lineNumber: 93,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/components/ImageUpload.tsx",
                                lineNumber: 92,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-400",
                                children: "Drop images here or click to upload"
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/components/ImageUpload.tsx",
                                lineNumber: 95,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-gray-500",
                                children: [
                                    maxImages - images.length,
                                    " image",
                                    maxImages - images.length !== 1 ? 's' : '',
                                    " remaining"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/ai-builder/components/ImageUpload.tsx",
                                lineNumber: 98,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/ai-builder/components/ImageUpload.tsx",
                        lineNumber: 91,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/ai-builder/components/ImageUpload.tsx",
                lineNumber: 69,
                columnNumber: 9
            }, this),
            images.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-3 flex-wrap",
                children: images.map((img, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative group rounded-lg overflow-hidden border border-gray-700",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: img,
                                alt: `Reference ${index + 1}`,
                                className: "w-24 h-24 object-cover"
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/components/ImageUpload.tsx",
                                lineNumber: 113,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>removeImage(index),
                                className: "absolute top-1 right-1 p-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/apps/ai-builder/components/ImageUpload.tsx",
                                    lineNumber: 122,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/components/ImageUpload.tsx",
                                lineNumber: 118,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute bottom-1 left-1 px-2 py-0.5 bg-black/70 rounded text-xs",
                                children: index + 1
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/components/ImageUpload.tsx",
                                lineNumber: 124,
                                columnNumber: 15
                            }, this)
                        ]
                    }, index, true, {
                        fileName: "[project]/apps/ai-builder/components/ImageUpload.tsx",
                        lineNumber: 109,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/ai-builder/components/ImageUpload.tsx",
                lineNumber: 107,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/ai-builder/components/ImageUpload.tsx",
        lineNumber: 62,
        columnNumber: 5
    }, this);
}
_s(ImageUpload, "f/co3DlvpkD3cJyAV9WP5cUP5XM=");
_c = ImageUpload;
var _c;
__turbopack_context__.k.register(_c, "ImageUpload");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/ai-builder/components/ChatInterface.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatInterface",
    ()=>ChatInterface
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/ai-builder/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/ai-builder/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bot.js [app-client] (ecmascript) <export default as Bot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pen-line.js [app-client] (ecmascript) <export default as Edit3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$components$2f$ImageUpload$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/ai-builder/components/ImageUpload.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function ChatInterface({ onCodeGenerated, storeId = 1, productId = 1 }) {
    _s();
    const [images, setImages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [prompt, setPrompt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isGenerating, setIsGenerating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentCode, setCurrentCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const messagesEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const chatContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Auto-scroll to bottom when new messages arrive
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatInterface.useEffect": ()=>{
            messagesEndRef.current?.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }["ChatInterface.useEffect"], [
        messages
    ]);
    const generateId = ()=>Math.random().toString(36).substr(2, 9);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!prompt.trim()) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Please enter a prompt');
            return;
        }
        // Add user message
        const userMessage = {
            id: generateId(),
            role: 'user',
            content: prompt.trim(),
            timestamp: new Date()
        };
        setMessages((prev)=>[
                ...prev,
                userMessage
            ]);
        // Clear prompt
        const currentPrompt = prompt.trim();
        setPrompt('');
        setIsGenerating(true);
        // Add assistant message placeholder
        const assistantId = generateId();
        setMessages((prev)=>[
                ...prev,
                {
                    id: assistantId,
                    role: 'assistant',
                    content: 'Generating your landing page...',
                    timestamp: new Date()
                }
            ]);
        try {
            // API will handle edit mode automatically based on existingCode
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: finalPrompt,
                    images: images.length > 0 ? images : undefined,
                    storeId,
                    productId,
                    existingCode: currentCode || undefined
                })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Generation failed');
            }
            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullCode = '';
            if (reader) {
                let buffer = '';
                while(true){
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, {
                        stream: true
                    });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    for (const line of lines){
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6).trim();
                            if (data === '[DONE]') continue;
                            try {
                                const json = JSON.parse(data);
                                const content = json.choices?.[0]?.delta?.content;
                                if (content) {
                                    fullCode += content;
                                    setCurrentCode(fullCode);
                                    onCodeGenerated(fullCode);
                                    // Update assistant message
                                    setMessages((prev)=>prev.map((m)=>m.id === assistantId ? {
                                                ...m,
                                                content: 'Generated! Click to see preview →',
                                                code: fullCode
                                            } : m));
                                }
                            } catch  {
                            // Ignore parse errors
                            }
                        }
                    }
                }
            }
            // Final update
            setMessages((prev)=>prev.map((m)=>m.id === assistantId ? {
                        ...m,
                        content: '✨ Landing page generated! You can ask me to modify any part.',
                        code: fullCode
                    } : m));
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Landing page generated!');
        } catch (error) {
            console.error('Generation error:', error);
            setMessages((prev)=>prev.map((m)=>m.id === assistantId ? {
                        ...m,
                        content: `❌ Error: ${error instanceof Error ? error.message : 'Generation failed'}`
                    } : m));
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error instanceof Error ? error.message : 'Failed to generate');
        } finally{
            setIsGenerating(false);
            setImages([]);
        }
    };
    const handleReset = ()=>{
        setMessages([]);
        setCurrentCode('');
        onCodeGenerated('');
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Conversation reset');
    };
    const examplePrompts = [
        '🛒 মধু বিক্রি করার জন্য একটি সুন্দর ল্যান্ডিং পেজ বানাও',
        '👟 Create a shoe product landing page with dark theme',
        '💄 Design a skincare product page with elegant pink colors'
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-gray-800 flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-semibold flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                        className: "w-5 h-5 text-purple-500"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                        lineNumber: 173,
                                        columnNumber: 13
                                    }, this),
                                    "AI Builder"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                lineNumber: 172,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-400 mt-1",
                                children: "Describe your landing page and watch it come to life"
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                lineNumber: 176,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                        lineNumber: 171,
                        columnNumber: 9
                    }, this),
                    messages.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleReset,
                        className: "text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-800",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                className: "w-3 h-3"
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                lineNumber: 185,
                                columnNumber: 13
                            }, this),
                            "New Chat"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                        lineNumber: 181,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                lineNumber: 170,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 py-2 border-b border-gray-800 bg-gray-900/50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 text-xs text-gray-500",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                            className: "w-3 h-3 text-purple-500"
                        }, void 0, false, {
                            fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                            lineNumber: 194,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "OpenRouter • arcee-ai/trinity-large-preview"
                        }, void 0, false, {
                            fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                            lineNumber: 195,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                    lineNumber: 193,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                lineNumber: 192,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: chatContainerRef,
                className: "flex-1 overflow-y-auto p-4 space-y-4",
                children: [
                    messages.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                            lineNumber: 206,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                        lineNumber: 205,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-gray-300",
                                                children: "হাই! 👋 আমি আপনার AI ল্যান্ডিং পেজ বিল্ডার। আপনার পণ্যের বর্ণনা দিন, আমি সাথে সাথে সুন্দর ল্যান্ডিং পেজ তৈরি করে দেব!"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                                lineNumber: 209,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-gray-500 mt-2",
                                                children: "Try an example:"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                                lineNumber: 212,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-2 mt-2",
                                                children: examplePrompts.map((example, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setPrompt(example),
                                                        className: "text-xs px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-gray-300 text-left",
                                                        children: example
                                                    }, i, false, {
                                                        fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                                        lineNumber: 217,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                                lineNumber: 215,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                        lineNumber: 208,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                lineNumber: 204,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "ml-11",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$components$2f$ImageUpload$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ImageUpload"], {
                                    images: images,
                                    onImagesChange: setImages,
                                    maxImages: 2
                                }, void 0, false, {
                                    fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                    lineNumber: 231,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                lineNumber: 230,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                        lineNumber: 203,
                        columnNumber: 11
                    }, this),
                    messages.map((message)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-600 to-pink-600'}`,
                                    children: message.role === 'user' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                        lineNumber: 248,
                                        columnNumber: 42
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                        lineNumber: 248,
                                        columnNumber: 73
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                    lineNumber: 243,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-gray-300 whitespace-pre-wrap",
                                            children: message.content
                                        }, void 0, false, {
                                            fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                            lineNumber: 251,
                                            columnNumber: 15
                                        }, this),
                                        message.role === 'assistant' && message.code && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-purple-400 mt-1 flex items-center gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__["Edit3"], {
                                                    className: "w-3 h-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                                    lineNumber: 254,
                                                    columnNumber: 19
                                                }, this),
                                                "Ask me to modify any part!"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                            lineNumber: 253,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-gray-600 mt-1",
                                            children: message.timestamp.toLocaleTimeString('bn-BD', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                            lineNumber: 258,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                    lineNumber: 250,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, message.id, true, {
                            fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                            lineNumber: 242,
                            columnNumber: 11
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: messagesEndRef
                    }, void 0, false, {
                        fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                        lineNumber: 266,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                lineNumber: 200,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                className: "p-4 border-t border-gray-800 bg-gray-900/30",
                children: [
                    messages.length > 0 && images.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-3",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$components$2f$ImageUpload$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ImageUpload"], {
                            images: images,
                            onImagesChange: setImages,
                            maxImages: 2
                        }, void 0, false, {
                            fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                            lineNumber: 274,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                        lineNumber: 273,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                value: prompt,
                                onChange: (e)=>setPrompt(e.target.value),
                                placeholder: messages.length > 0 ? "বলুন কি পরিবর্তন করতে চান..." : "আপনার পণ্যের বিস্তারিত বলুন...",
                                rows: 2,
                                className: "flex-1 resize-none bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500",
                                disabled: isGenerating,
                                onKeyDown: (e)=>{
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                lineNumber: 283,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                disabled: isGenerating || !prompt.trim(),
                                className: "px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center",
                                children: isGenerating ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    className: "w-5 h-5 animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                    lineNumber: 303,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                    lineNumber: 305,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                lineNumber: 297,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                        lineNumber: 282,
                        columnNumber: 9
                    }, this),
                    isGenerating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-purple-400 mt-2 flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "animate-pulse",
                                children: "●"
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                                lineNumber: 312,
                                columnNumber: 13
                            }, this),
                            "কোড জেনারেট হচ্ছে..."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                        lineNumber: 311,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
                lineNumber: 270,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/ai-builder/components/ChatInterface.tsx",
        lineNumber: 168,
        columnNumber: 5
    }, this);
}
_s(ChatInterface, "gZxJ2x1+cE1lx0faORzR0AOPkIA=");
_c = ChatInterface;
var _c;
__turbopack_context__.k.register(_c, "ChatInterface");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/ai-builder/lib/order-integration.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractCode",
    ()=>extractCode,
    "injectOrderForm",
    ()=>injectOrderForm
]);
function injectOrderForm(code, config) {
    // Replace placeholders with actual values
    let processedCode = code.replace(/__STORE_ID__/g, String(config.storeId)).replace(/__PRODUCT_ID__/g, String(config.productId)).replace(/__API_URL__/g, config.apiUrl);
    return processedCode;
}
function extractCode(response) {
    // Remove markdown code fences if present
    const codeBlockMatch = response.match(/```(?:jsx?|tsx?|react)?\n?([\s\S]*?)```/);
    if (codeBlockMatch) {
        return codeBlockMatch[1].trim();
    }
    // If no code block, assume the entire response is code
    return response.trim();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/ai-builder/components/CodePreview.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CodePreview",
    ()=>CodePreview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/ai-builder/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/ai-builder/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$codesandbox$2f$sandpack$2d$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@codesandbox/sandpack-react/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Code$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/code.js [app-client] (ecmascript) <export default as Code>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-client] (ecmascript) <export default as Maximize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minimize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minimize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minimize-2.js [app-client] (ecmascript) <export default as Minimize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.js [app-client] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$terminal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Terminal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/terminal.js [app-client] (ecmascript) <export default as Terminal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$lib$2f$order$2d$integration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/ai-builder/lib/order-integration.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function CodePreview({ code, orderConfig, isFullscreen = false }) {
    _s();
    const [showCode, setShowCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showFullscreen, setShowFullscreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasError, setHasError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isStreaming, setIsStreaming] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const prevCodeLengthRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const codeDisplayRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Detect streaming state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CodePreview.useEffect": ()=>{
            if (code.length > prevCodeLengthRef.current) {
                setIsStreaming(true);
            }
            prevCodeLengthRef.current = code.length;
            // Auto-scroll to bottom of code display while streaming
            if (codeDisplayRef.current && isStreaming) {
                codeDisplayRef.current.scrollTop = codeDisplayRef.current.scrollHeight;
            }
            // Stop streaming detection after 1 second of no changes
            const timer = setTimeout({
                "CodePreview.useEffect.timer": ()=>{
                    setIsStreaming(false);
                }
            }["CodePreview.useEffect.timer"], 1000);
            return ({
                "CodePreview.useEffect": ()=>clearTimeout(timer)
            })["CodePreview.useEffect"];
        }
    }["CodePreview.useEffect"], [
        code,
        isStreaming
    ]);
    // Process the code: extract and inject order form
    const processedCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CodePreview.useMemo[processedCode]": ()=>{
            if (!code) return '';
            try {
                const extractedCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$lib$2f$order$2d$integration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractCode"])(code);
                const withOrderForm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$lib$2f$order$2d$integration$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["injectOrderForm"])(extractedCode, orderConfig);
                // Basic validation - check if code looks complete
                const hasExport = withOrderForm.includes('export default') || withOrderForm.includes('export function');
                const openBraces = (withOrderForm.match(/\{/g) || []).length;
                const closeBraces = (withOrderForm.match(/\}/g) || []).length;
                const balanced = openBraces === closeBraces && openBraces > 0;
                if (!hasExport || !balanced) {
                    setHasError(true);
                } else {
                    setHasError(false);
                }
                return withOrderForm;
            } catch  {
                setHasError(true);
                return code;
            }
        }
    }["CodePreview.useMemo[processedCode]"], [
        code,
        orderConfig
    ]);
    // Safe code wrapper for incomplete code
    const safeCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CodePreview.useMemo[safeCode]": ()=>{
            if (!processedCode) {
                return `
export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-white mb-4">🚀 AI Landing Builder</h1>
        <p className="text-gray-400 text-lg">আপনার পণ্যের বিবরণ দিন, সুন্দর ল্যান্ডিং পেজ তৈরি হবে!</p>
        <div className="mt-8 flex justify-center gap-4">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
}
`;
            }
            if (hasError || isStreaming) {
                return `
export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 text-purple-400 mb-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">কোড জেনারেট হচ্ছে...</span>
          </div>
          <p className="text-gray-400 text-sm">সম্পূর্ণ হলে preview দেখা যাবে</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 font-mono text-xs text-green-400 overflow-auto max-h-[500px]">
          <pre className="whitespace-pre-wrap">${processedCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')}</pre>
        </div>
      </div>
    </div>
  );
}
`;
            }
            return processedCode;
        }
    }["CodePreview.useMemo[safeCode]"], [
        processedCode,
        hasError,
        isStreaming
    ]);
    // Sandpack files
    const files = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CodePreview.useMemo[files]": ()=>({
                '/App.js': {
                    code: safeCode
                },
                '/styles.css': {
                    code: `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Hind Siliguri', 'Inter', sans-serif;
}

html {
  scroll-behavior: smooth;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
`
                }
            })
    }["CodePreview.useMemo[files]"], [
        safeCode
    ]);
    const copyCode = async ()=>{
        await navigator.clipboard.writeText(processedCode);
        setCopied(true);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('কোড কপি হয়েছে');
        setTimeout(()=>setCopied(false), 2000);
    };
    const downloadCode = ()=>{
        const blob = new Blob([
            processedCode
        ], {
            type: 'text/javascript'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'LandingPage.jsx';
        a.click();
        URL.revokeObjectURL(url);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('কোড ডাউনলোড হয়েছে');
    };
    // Fullscreen mode (internal toggle)
    if (showFullscreen) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 z-50 bg-black",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute top-4 right-4 z-10 flex gap-2",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowFullscreen(false),
                        className: "p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-white",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minimize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minimize2$3e$__["Minimize2"], {
                            className: "w-5 h-5"
                        }, void 0, false, {
                            fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                            lineNumber: 193,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                        lineNumber: 189,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                    lineNumber: 188,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$codesandbox$2f$sandpack$2d$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SandpackProvider"], {
                    template: "react",
                    theme: "dark",
                    files: files,
                    options: {
                        externalResources: [
                            'https://cdn.tailwindcss.com'
                        ]
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$codesandbox$2f$sandpack$2d$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SandpackPreview"], {
                        showNavigator: false,
                        showRefreshButton: true,
                        showOpenInCodeSandbox: false,
                        style: {
                            height: '100vh',
                            width: '100%'
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                        lineNumber: 204,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                    lineNumber: 196,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
            lineNumber: 187,
            columnNumber: 7
        }, this);
    }
    // Prop-based fullscreen (from parent)
    if (isFullscreen) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full w-full",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$codesandbox$2f$sandpack$2d$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SandpackProvider"], {
                template: "react",
                theme: "dark",
                files: files,
                options: {
                    externalResources: [
                        'https://cdn.tailwindcss.com'
                    ]
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$codesandbox$2f$sandpack$2d$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SandpackPreview"], {
                    showNavigator: false,
                    showRefreshButton: true,
                    showOpenInCodeSandbox: false,
                    style: {
                        height: '100vh',
                        width: '100%'
                    }
                }, void 0, false, {
                    fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                    lineNumber: 227,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                lineNumber: 219,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
            lineNumber: 218,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full min-h-0 bg-gray-950 rounded-xl overflow-hidden border border-gray-800",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowCode(false),
                                className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${!showCode ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                                        lineNumber: 249,
                                        columnNumber: 13
                                    }, this),
                                    "Preview"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                                lineNumber: 243,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowCode(true),
                                className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${showCode ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Code$3e$__["Code"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                                        lineNumber: 258,
                                        columnNumber: 13
                                    }, this),
                                    "Code"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                                lineNumber: 252,
                                columnNumber: 11
                            }, this),
                            (hasError || isStreaming) && code && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-1 text-xs text-purple-400 ml-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$terminal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Terminal$3e$__["Terminal"], {
                                        className: "w-3 h-3 animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                                        lineNumber: 264,
                                        columnNumber: 15
                                    }, this),
                                    isStreaming ? 'Streaming...' : 'Generating...'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                                lineNumber: 263,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                        lineNumber: 242,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: copyCode,
                                disabled: !processedCode,
                                className: "p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50",
                                title: "কোড কপি করুন",
                                children: copied ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                    className: "w-4 h-4 text-green-500"
                                }, void 0, false, {
                                    fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                                    lineNumber: 277,
                                    columnNumber: 23
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                                    lineNumber: 277,
                                    columnNumber: 70
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                                lineNumber: 271,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: downloadCode,
                                disabled: !processedCode,
                                className: "p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50",
                                title: "কোড ডাউনলোড করুন",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                                    lineNumber: 285,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                                lineNumber: 279,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowFullscreen(true),
                                className: "p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors",
                                title: "ফুলস্ক্রিন প্রিভিউ",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                                    lineNumber: 292,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                                lineNumber: 287,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                        lineNumber: 270,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                lineNumber: 241,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-h-0 overflow-hidden",
                children: showCode ? // Streaming Code View - Real-time line by line with scroll
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-full overflow-auto bg-gray-900",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                        ref: codeDisplayRef,
                        className: "p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap",
                        children: [
                            processedCode || '// কোড এখানে দেখা যাবে...',
                            isStreaming && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1"
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                                lineNumber: 308,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                        lineNumber: 302,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                    lineNumber: 301,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-full w-full",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$codesandbox$2f$sandpack$2d$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SandpackProvider"], {
                        template: "react",
                        theme: "dark",
                        files: files,
                        options: {
                            externalResources: [
                                'https://cdn.tailwindcss.com'
                            ]
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$codesandbox$2f$sandpack$2d$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SandpackPreview"], {
                            showNavigator: false,
                            showRefreshButton: true,
                            showOpenInCodeSandbox: false,
                            style: {
                                height: '100%',
                                width: '100%'
                            }
                        }, void 0, false, {
                            fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                            lineNumber: 322,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                        lineNumber: 314,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                    lineNumber: 313,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                lineNumber: 298,
                columnNumber: 7
            }, this),
            processedCode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 py-2 border-t border-gray-800 bg-gray-900/30 flex items-center justify-between text-xs text-gray-500",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            processedCode.split('\n').length,
                            " lines • ",
                            (processedCode.length / 1024).toFixed(1),
                            " KB"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                        lineNumber: 336,
                        columnNumber: 11
                    }, this),
                    !hasError && !isStreaming && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-green-500 flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                className: "w-3 h-3"
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                                lineNumber: 341,
                                columnNumber: 15
                            }, this),
                            "সম্পূর্ণ"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                        lineNumber: 340,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
                lineNumber: 335,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/ai-builder/components/CodePreview.tsx",
        lineNumber: 239,
        columnNumber: 5
    }, this);
}
_s(CodePreview, "aqIEUHmkRm6jk0mO1Ueaoe8eEIE=");
_c = CodePreview;
var _c;
__turbopack_context__.k.register(_c, "CodePreview");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/ai-builder/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/apps/ai-builder/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/ai-builder/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/ai-builder/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$components$2f$ChatInterface$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/ai-builder/components/ChatInterface.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$components$2f$CodePreview$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/ai-builder/components/CodePreview.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.js [app-client] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-client] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-client] (ecmascript) <export default as Maximize2>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function HomePage() {
    _s();
    const [generatedCode, setGeneratedCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showSettings, setShowSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showChat, setShowChat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isFullPreview, setIsFullPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Config from env or defaults
    const [config, setConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        storeId: parseInt(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_DEFAULT_STORE_ID || '1'),
        productId: parseInt(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_DEFAULT_PRODUCT_ID || '1'),
        apiUrl: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_MAIN_API_URL || 'https://ozzyl.com'
    });
    // Full preview mode
    if (isFullPreview && generatedCode) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 z-50 bg-black",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute top-4 right-4 z-10 flex gap-2",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setIsFullPreview(false),
                        className: "p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-white flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "w-5 h-5"
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/app/page.tsx",
                                lineNumber: 30,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm",
                                children: "প্রিভিউ বন্ধ করুন"
                            }, void 0, false, {
                                fileName: "[project]/apps/ai-builder/app/page.tsx",
                                lineNumber: 31,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/ai-builder/app/page.tsx",
                        lineNumber: 26,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/ai-builder/app/page.tsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>{
                        setIsFullPreview(false);
                        setShowChat(true);
                    },
                    className: "absolute bottom-6 right-6 z-10 p-4 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors text-white shadow-lg",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                        className: "w-6 h-6"
                    }, void 0, false, {
                        fileName: "[project]/apps/ai-builder/app/page.tsx",
                        lineNumber: 43,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/ai-builder/app/page.tsx",
                    lineNumber: 36,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$components$2f$CodePreview$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CodePreview"], {
                    code: generatedCode,
                    orderConfig: config,
                    isFullscreen: true
                }, void 0, false, {
                    fileName: "[project]/apps/ai-builder/app/page.tsx",
                    lineNumber: 46,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/ai-builder/app/page.tsx",
            lineNumber: 24,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-screen flex flex-col overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex-shrink-0 border-b border-gray-800 px-4 py-3 bg-gray-950/90 backdrop-blur-sm z-20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-screen-2xl mx-auto flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-2 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                        className: "w-5 h-5"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/ai-builder/app/page.tsx",
                                        lineNumber: 62,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/ai-builder/app/page.tsx",
                                    lineNumber: 61,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "font-bold text-lg",
                                            children: "AI Landing Builder"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                                            lineNumber: 65,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-gray-500",
                                            children: "OpenRouter দ্বারা চালিত"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                                            lineNumber: 66,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/ai-builder/app/page.tsx",
                                    lineNumber: 64,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                            lineNumber: 60,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                generatedCode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsFullPreview(true),
                                    className: "flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                                            lineNumber: 76,
                                            columnNumber: 17
                                        }, this),
                                        "ফুল স্ক্রিন"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/ai-builder/app/page.tsx",
                                    lineNumber: 72,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowSettings(!showSettings),
                                    className: "p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                        className: "w-5 h-5"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/ai-builder/app/page.tsx",
                                        lineNumber: 84,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/ai-builder/app/page.tsx",
                                    lineNumber: 80,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                            lineNumber: 70,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/ai-builder/app/page.tsx",
                    lineNumber: 59,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/ai-builder/app/page.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            showSettings && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-shrink-0 border-b border-gray-800 px-4 py-4 bg-gray-900/50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-screen-2xl mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-sm font-medium mb-3",
                            children: "অর্ডার ইন্টিগ্রেশন সেটিংস"
                        }, void 0, false, {
                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                            lineNumber: 94,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-3 gap-4 max-w-2xl",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-xs text-gray-500 mb-1",
                                            children: "Store ID"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                                            lineNumber: 97,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            value: config.storeId,
                                            onChange: (e)=>setConfig({
                                                    ...config,
                                                    storeId: parseInt(e.target.value) || 1
                                                }),
                                            className: "w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm focus:outline-none focus:border-purple-500"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                                            lineNumber: 98,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/ai-builder/app/page.tsx",
                                    lineNumber: 96,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-xs text-gray-500 mb-1",
                                            children: "Product ID"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                                            lineNumber: 106,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            value: config.productId,
                                            onChange: (e)=>setConfig({
                                                    ...config,
                                                    productId: parseInt(e.target.value) || 1
                                                }),
                                            className: "w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm focus:outline-none focus:border-purple-500"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                                            lineNumber: 107,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/ai-builder/app/page.tsx",
                                    lineNumber: 105,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-xs text-gray-500 mb-1",
                                            children: "API URL"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                                            lineNumber: 115,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: config.apiUrl,
                                            onChange: (e)=>setConfig({
                                                    ...config,
                                                    apiUrl: e.target.value
                                                }),
                                            className: "w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm focus:outline-none focus:border-purple-500"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                                            lineNumber: 116,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/ai-builder/app/page.tsx",
                                    lineNumber: 114,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                            lineNumber: 95,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/ai-builder/app/page.tsx",
                    lineNumber: 93,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/ai-builder/app/page.tsx",
                lineNumber: 92,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 flex overflow-hidden relative min-h-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex-1 p-4 overflow-hidden transition-all duration-300 ${showChat ? 'mr-[400px]' : ''}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$components$2f$CodePreview$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CodePreview"], {
                            code: generatedCode,
                            orderConfig: config,
                            isFullscreen: false
                        }, void 0, false, {
                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                            lineNumber: 132,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/ai-builder/app/page.tsx",
                        lineNumber: 131,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `fixed right-0 top-[65px] bottom-[41px] w-[400px] border-l border-gray-800 bg-gray-950 flex flex-col transition-transform duration-300 z-10 ${showChat ? 'translate-x-0' : 'translate-x-full'}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$components$2f$ChatInterface$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ChatInterface"], {
                            onCodeGenerated: setGeneratedCode,
                            storeId: config.storeId,
                            productId: config.productId
                        }, void 0, false, {
                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                            lineNumber: 141,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/ai-builder/app/page.tsx",
                        lineNumber: 140,
                        columnNumber: 9
                    }, this),
                    !showChat && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowChat(true),
                        className: "fixed bottom-16 right-6 p-4 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors text-white shadow-lg z-10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                            className: "w-6 h-6"
                        }, void 0, false, {
                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                            lineNumber: 154,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/ai-builder/app/page.tsx",
                        lineNumber: 150,
                        columnNumber: 11
                    }, this),
                    showChat && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowChat(false),
                        className: "fixed top-20 right-[410px] p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-gray-400 hover:text-white z-20",
                        title: "চ্যাট লুকান",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                            lineNumber: 165,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/ai-builder/app/page.tsx",
                        lineNumber: 160,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/ai-builder/app/page.tsx",
                lineNumber: 129,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "flex-shrink-0 border-t border-gray-800 px-4 py-2 bg-gray-950/90",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-screen-2xl mx-auto flex items-center justify-between text-xs text-gray-500",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "AI জেনারেটেড কোড রিভিউ করা উচিত"
                        }, void 0, false, {
                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                            lineNumber: 173,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: "https://openrouter.ai",
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "flex items-center gap-1 hover:text-gray-300 transition-colors",
                            children: [
                                "Powered by OpenRouter",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$ai$2d$builder$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                    className: "w-3 h-3"
                                }, void 0, false, {
                                    fileName: "[project]/apps/ai-builder/app/page.tsx",
                                    lineNumber: 181,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/ai-builder/app/page.tsx",
                            lineNumber: 174,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/ai-builder/app/page.tsx",
                    lineNumber: 172,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/ai-builder/app/page.tsx",
                lineNumber: 171,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/ai-builder/app/page.tsx",
        lineNumber: 56,
        columnNumber: 5
    }, this);
}
_s(HomePage, "RICuHGPIQpMWMf50qkwBNRx4MDw=");
_c = HomePage;
var _c;
__turbopack_context__.k.register(_c, "HomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_ai-builder_bdf5f682._.js.map