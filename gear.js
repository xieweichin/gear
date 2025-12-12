function inv(alpha) {
    return Math.tan(alpha) - alpha;
}

// 漸開線座標（單側）
function involutePoint(baseR, t) {
    return {
        x: baseR * (Math.cos(t) + t * Math.sin(t)),
        y: baseR * (Math.sin(t) - t * Math.cos(t))
    };
}

function generate() {
    const m = parseFloat(document.getElementById("mod").value);
    const z = parseInt(document.getElementById("teeth").value);
    const alphaDeg = parseFloat(document.getElementById("alpha").value);
    const alpha = alphaDeg * Math.PI / 180;

    const pitchR = (m * z) / 2;
    const baseR = pitchR * Math.cos(alpha);
    const outerR = m * (z + 2) / 2;
    const rootR = m * (z - 2.5) / 2;

    // 每齒角度
    const toothAngle = 2 * Math.PI / z;

    let points = [];

    // generate one tooth and rotate copies
    const steps = 50;
    for (let i = 0; i < z; i++) {
        const angleOffset = i * toothAngle;

        // involute from base circle to outer circle
        for (let t = 0; t <= 0.9; t += 1/steps) {
            const p = involutePoint(baseR, t);
            const scale = outerR / Math.sqrt(p.x*p.x + p.y*p.y);
            const px = p.x * scale;
            const py = p.y * scale;

            const rx = px * Math.cos(angleOffset) - py * Math.sin(angleOffset);
            const ry = px * Math.sin(angleOffset) + py * Math.cos(angleOffset);

            points.push([rx, ry]);
        }
    }

    drawPreview(points);
    exportDXF(points);
}

function drawPreview(pts) {
    const canvas = document.getElementById("preview");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(1, -1);

    ctx.beginPath();
    ctx.strokeStyle = "black";

    pts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
    });

    ctx.stroke();
    ctx.setTransform(1,0,0,1,0,0);
}

function exportDXF(pts) {
    let dxf = "0\nSECTION\n2\nENTITIES\n0\nLWPOLYLINE\n8\nGEAR\n90\n" + pts.length + "\n70\n1\n";

    pts.forEach(p => {
        dxf += "10\n" + p[0] + "\n20\n" + p[1] + "\n";
    });

    dxf += "0\nENDSEC\n0\nEOF";

    const blob = new Blob([dxf], {type: "application/dxf"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "gear.dxf";
    a.click();
}
