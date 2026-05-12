import matplotlib.pyplot as plt
import numpy as np
import matplotlib as mpl

import argparse
import os
from dataclasses import dataclass
from typing import Dict, List, Tuple


data = {
    "Ours": {
        "faces": [
            265,
            # 1100,
            2702,
            5262,
            9803,
            14809,
        ],
        "times": [
            5.47,
            # 4.889,
            5.031,
            5.298,
            4.857,
            9.873292,
        ],
        "color": "#e31a1c",
        "marker": "h",
        "marker_size": 12,
    },
    "MeshAnythingV2": {
        "faces": [
            623,
            1404,
            1995,
            3190,
            4029,
        ],
        "times": [
            36.85,
            81.25,
            109.4,
            164.2,
            251.8,
        ],
        "color": "#6a3d9a",
        "marker": "v",
        "marker_size": 12,
    },
    "MeshSilkSong": {
        "faces": [
            460,
            661,
            1211,
            1612,
            2001,
        ],
        "times": [
            13.65,
            22.87,
            39.84,
            50.31,
            70.86,
        ],
        "color": "#1b9e77",
        "marker": "D",
        "marker_size": 10,
    },
    # "FastMesh": {
    #     "faces": [
    #         4001,
    #         6787,
    #         9475,
    #         11426,
    #         14666,
    #     ],
    #     "times": [
    #         5.289,
    #         7.636,
    #         10.66,
    #         16.09,
    #         19.02,
    #     ],
    #     "color": "orange",
    #     "marker": "^",
    # },
    "BPT": {
        "faces": [
            638,
            1807,
            2896,
            3558,
            4283,
        ],
        "times": [
            42.23,
            117,
            180.3,
            219.2,
            299.9,
        ],
        "color": "#f28e2b",
        "marker": "s",
        "marker_size": 10,
    },
    "DeepMesh": {
        "faces": [
            3526,
            5355,
            9242,
            12084,
            13737,
        ],
        "times": [
            147.5,
            241.2,
            415.8,
            484,
            565.7,
        ],
        "color": "#1f2a6d",
        "marker": "*",
        "marker_size": 16,
    },
}


@dataclass(frozen=True)
class Series:
    name: str
    faces: List[float]
    times: List[float]
    color: str
    marker: str
    marker_size: int


def _as_series(raw: Dict[str, dict]) -> List[Series]:
    series_list: List[Series] = []
    for name, spec in raw.items():
        faces = list(spec.get("faces", []))
        times = list(spec.get("times", []))
        if len(faces) != len(times):
            raise ValueError(
                f"{name}: faces/times 长度不一致：{len(faces)} vs {len(times)}"
            )
        series_list.append(
            Series(
                name=name,
                faces=faces,
                times=times,
                color=str(spec.get("color", "C0")),
                marker=str(spec.get("marker", "o")),
                marker_size=int(spec.get("marker_size", 10)),
            )
        )
    return series_list


def _sorted_by_x(
    times: List[float], faces: List[float]
) -> Tuple[np.ndarray, np.ndarray]:
    x = np.asarray(times, dtype=float)
    y = np.asarray(faces, dtype=float)
    if x.size == 0:
        return x, y
    order = np.argsort(x)
    return x[order], y[order]


def _size_labels(n: int) -> List[str]:
    palette = ["S", "M", "L", "X", "XL", "XXL"]
    if n <= len(palette):
        return palette[:n]
    return [f"{i+1}" for i in range(n)]


def _apply_paper_font():
    mpl.rcParams.update(
        {
            "font.family": "serif",
            "font.serif": [
                "Times",
                "Times New Roman",
                "Nimbus Roman",
                "DejaVu Serif",
            ],
            "mathtext.fontset": "stix",
            "axes.unicode_minus": False,
        }
    )


def plot_latency_vs_faces(
    series_list: List[Series],
    *,
    title: str,
    out_path: str,
    dpi: int = 200,
    annotate: bool = True,
    logy: bool = False,
    highlight_name: str = "Ours",
    flip_xy: bool = False,
    legend_loc: str = "upper left",
    time_line: int = 10,
    legend_fontsize: int = 10,
    fontsize: int = 16,
):
    plt.style.use("seaborn-v0_8-paper")

    _apply_paper_font()

    fig, ax = plt.subplots(figsize=(6, 4))
    ax.set_title(title, fontsize=fontsize, pad=10)

    if flip_xy:
        ax.set_xlabel("Face Numbers", fontsize=fontsize)
        ax.set_ylabel("Inference Time (s)", fontsize=fontsize)
    else:
        ax.set_xlabel("Inference Time (s)", fontsize=fontsize)
        ax.set_ylabel("Face Numbers", fontsize=fontsize)
    if logy:
        ax.set_yscale("log")

    ax.grid(True, which="major", linestyle="-", alpha=0.35)
    ax.grid(True, which="minor", linestyle=":", alpha=0.2)

    for s in series_list:
        if flip_xy:
            x, y = _sorted_by_x(s.faces, s.times)
        else:
            x, y = _sorted_by_x(s.times, s.faces)
        if x.size == 0:
            continue

        is_highlight = s.name == highlight_name
        line_width = 1.6 if is_highlight else 1.2
        alpha = 0.95 if is_highlight else 0.85

        ax.plot(
            x,
            y,
            color=s.color,
            linewidth=line_width,
            marker=s.marker,
            markersize=s.marker_size,
            alpha=alpha,
            label=s.name,
        )

        if annotate:
            labels = _size_labels(len(x))
            y_order = np.argsort(y)
            label_for_idx = {int(idx): labels[i] for i, idx in enumerate(y_order)}
            for i in range(len(x)):
                tag = label_for_idx.get(i, "")
                if not tag:
                    continue
                ax.annotate(
                    tag,
                    (x[i], y[i]),
                    textcoords="offset points",
                    xytext=(6, 6),
                    fontsize=fontsize,
                    color=s.color,
                    weight="bold" if is_highlight else "normal",
                )

    if time_line is not None:
        if flip_xy:
            ax.axhline(
                time_line, color="#444444", linestyle="--", linewidth=0.6, alpha=0.9
            )
        else:
            ax.axvline(
                time_line, color="#444444", linestyle="--", linewidth=0.6, alpha=0.9
            )

    leg = ax.legend(
        loc=legend_loc, frameon=True, framealpha=0.9, fontsize=legend_fontsize
    )
    leg.get_frame().set_edgecolor("#333333")
    leg.get_frame().set_linewidth(1.0)

    ax.margins(x=0.05, y=0.08)
    fig.tight_layout()

    # if flip_xy:
    #     plt.yticks(
    #         np.array([0, time_line, 100, 200, 300, 400, 500, 600]),
    #         labels=[0, f"{time_line}", "100", "200", "300", "400", "500", "600"],
    #     )
    # else:
    #     plt.xticks(
    #         np.array([0, time_line, 100, 200, 300, 400, 500, 600]),
    #         labels=[0, f"{time_line}", "100", "200", "300", "400", "500", "600"],
    #     )

    plt.tick_params(labelsize=fontsize)

    out_dir = os.path.dirname(out_path)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    fig.savefig(out_path, dpi=dpi, bbox_inches="tight")


def main():
    parser = argparse.ArgumentParser(description="Latency vs Faces plot (paper-style)")
    parser.add_argument(
        "--out",
        default=os.path.join("speed_test", "outputs", "latency_vs_faces.png"),
    )
    parser.add_argument("--dpi", type=int, default=200)
    parser.add_argument("--no-annotate", action="store_true")
    parser.add_argument("--logy", action="store_true")
    parser.add_argument("--flip-xy", action="store_true")
    parser.add_argument(
        "--title", default="Inference Time Comparison"
    )
    parser.add_argument("--highlight", default="Ours")
    parser.add_argument(
        "--legend-loc",
        default="upper left",
    )
    parser.add_argument(
        "--time-line",
        type=int,
        default=10,
    )
    args = parser.parse_args()

    series_list = _as_series(data)
    plot_latency_vs_faces(
        series_list,
        title=args.title,
        out_path=args.out,
        dpi=args.dpi,
        annotate=not args.no_annotate,
        logy=args.logy,
        highlight_name=args.highlight,
        flip_xy=args.flip_xy,
        legend_loc=args.legend_loc,
        time_line=args.time_line,
    )


if __name__ == "__main__":
    main()
