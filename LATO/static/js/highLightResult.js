import { createObjViewer } from "./OBJViewer.js";

const objPaths = [
    "./static/objs/1.obj",
    "./static/objs/2.obj",
    "./static/objs/3.obj",
    "./static/objs/sample_0_recon_fixed_teaser.obj",
    "./static/objs/sample_106_recon_fixed_teaser.obj",
    "./static/objs/sample_11_recon_fixed.obj",
    "./static/objs/sample_149_recon_fixed_teaser.obj",
    "./static/objs/sample_16_recon_fixed.obj",
    "./static/objs/sample_169_recon_fixed_teaser.obj",
    "./static/objs/sample_17_recon_fixed.obj",
    "./static/objs/sample_170_recon_fixed.obj",
    "./static/objs/sample_177_recon_fixed.obj",
    "./static/objs/sample_192_recon_fixed.obj",
    "./static/objs/sample_2_recon_fixed.obj",
    "./static/objs/sample_20_recon_fixed.obj",
    "./static/objs/sample_3_recon_fixed_kaimen.obj",
    "./static/objs/sample_3_recon_fixed_pangxie.obj",
    "./static/objs/sample_33_recon_fixed_haimian_baby.obj",
    "./static/objs/sample_34_recon_fixed_yuhangyuan.obj",
    "./static/objs/sample_35_recon_fixed.obj",
    "./static/objs/sample_38_recon_fixed.obj",
    "./static/objs/sample_41_recon_fixed.obj",
    "./static/objs/sample_47_recon_fixed.obj",
    "./static/objs/sample_49_recon_fixed.obj",
    "./static/objs/sample_5_recon_fixed.obj",
    "./static/objs/sample_56_recon_fixed_turtle.obj",
    "./static/objs/sample_58_recon_fixed_teaser.obj",
    "./static/objs/sample_60_recon_fixed.obj",
    "./static/objs/sample_64_recon_fixed.obj",
    "./static/objs/sample_68_recon_fixed_mouse_ball.obj",
    "./static/objs/sample_7_recon_fixed.obj",
    "./static/objs/sample_95_recon_fixed_teaser.obj",
]

const highLightResultPrevButtonId = "obj-viewer-container-prev";
const highLightResultNextButtonId = "obj-viewer-container-next";
const highLightResultLabelId = "obj-viewer-container-label";
const highLightResultGridId = "obj-viewer-grid";
const visibleViewerAmount = 8;
const meshColorPresets = {
    paperBlue: {
        color1: 0x36465f,
        color2: 0xd7c7d2,
        wireframeColor: 0x2b2f3d,
        backgroundColor: 0xf8f8f6,
    },
    sage: {
        color1: 0x6d7f79,
        color2: 0xb7c8bd,
        wireframeColor: 0x33413d,
        backgroundColor: 0xf7faf8,
    },
    clay: {
        color1: 0x8f5d38,
        color2: 0xd5a078,
        wireframeColor: 0x4f352a,
        backgroundColor: 0xfbfaf7,
    },
    graphite: {
        color1: 0x4e5661,
        color2: 0xb8c0c8,
        wireframeColor: 0x252b31,
        backgroundColor: 0xf6f7f8,
    },
    teal: {
        color1: 0x128d82,
        color2: 0x9fd8cd,
        wireframeColor: 0x1f4f4a,
        backgroundColor: 0xf2faf8,
    },
};
const activeMeshColorPreset = "paperBlue";
const meshViewerOptions = {
    ...meshColorPresets[activeMeshColorPreset],
    metalness: 0.08,
    roughness: 0.88,
    wireframe: true,
    wireframeOpacity: 0.22,
    autoRotateSpeed: 0.7,
};

function addHighLightResult(){
    const highLightResultPrevButton = document.getElementById(highLightResultPrevButtonId);
    const highLightResultNextButton = document.getElementById(highLightResultNextButtonId);
    const highLightResultLabel = document.getElementById(highLightResultLabelId);
    const highLightResultGrid = document.getElementById(highLightResultGridId);

    if (!highLightResultGrid) return;
    highLightResultGrid.textContent = "";
    const viewerAmount = Math.min(visibleViewerAmount, objPaths.length);
    const viewerInfo = [];
    const cards = [];
    let currentStartDisplayIdx = 0;

    for (let index = 0; index < viewerAmount; index++) {
        const card = document.createElement("div");
        card.className = "mesh-pair";

        const viewer = document.createElement("div");
        viewer.id = `obj-viewer-${index + 1}`;
        viewer.className = "canvas-slot";

        card.appendChild(viewer);
        highLightResultGrid.appendChild(card);
        cards.push({ card, viewer });
    }

    const update = () => {
        cards.forEach(({ card, viewer }, slotIndex) => {
            const objPath = objPaths[currentStartDisplayIdx + slotIndex];
            card.hidden = !objPath;
            if (!objPath) return;

            if (!viewerInfo[slotIndex]) {
                viewerInfo[slotIndex] = createObjViewer(viewer, objPath, meshViewerOptions);
            } else {
                viewerInfo[slotIndex].update(objPath);
            }
        });

        if (highLightResultLabel && objPaths.length > viewerAmount) {
            const start = currentStartDisplayIdx + 1;
            const end = Math.min(currentStartDisplayIdx + viewerAmount, objPaths.length);
            highLightResultLabel.textContent = `Examples ${start}-${end} of ${objPaths.length}`;
        } else if (highLightResultLabel) {
            highLightResultLabel.textContent = "";
        }
    };

    const hasMultiplePages = objPaths.length > viewerAmount;
    if (highLightResultPrevButton) {
        highLightResultPrevButton.hidden = !hasMultiplePages;
        highLightResultPrevButton.onclick = () => {
            currentStartDisplayIdx = currentStartDisplayIdx === 0
                ? Math.max(0, objPaths.length - viewerAmount)
                : Math.max(0, currentStartDisplayIdx - viewerAmount);
            update();
        };
    }
    if (highLightResultNextButton) {
        highLightResultNextButton.hidden = !hasMultiplePages;
        highLightResultNextButton.onclick = () => {
            currentStartDisplayIdx = currentStartDisplayIdx + viewerAmount >= objPaths.length
                ? 0
                : currentStartDisplayIdx + viewerAmount;
            update();
        };
    }

    update();

    addHighLightResult = () => {
        console.warn("[addHighLightResult] Don't Call this function more than once!")
    };
}

export {addHighLightResult};





