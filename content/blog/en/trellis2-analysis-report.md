---
title: "TRELLIS.2 Deep Dive: Microsoft's Revolutionary 4B-Parameter 3D Generation Model"
description: "A comprehensive analysis of Microsoft TRELLIS.2 — the first 4B-parameter image-to-3D generation model built on a native 3D VAE and the O-Voxel sparse voxel representation. From architecture design to usage tutorials, from core innovations to design philosophy, this article delivers an in-depth interpretation."
date: "2026-07-31"
author: "TopDigg Research Team"
tags: ["TRELLIS.2", "3D Generation", "O-Voxel", "Image-to-3D", "AI Generation", "Microsoft", "Sparse Voxel", "PBR Materials", "Deep Learning", "3D Generation Model"]
categories: ["Deep Dive"]
keywords: ["TRELLIS.2", "3D Generation", "O-Voxel", "Image-to-3D", "Microsoft AI", "Sparse Voxel", "PBR Materials", "Deep Learning", "3D Generation Model", "Structured Latents"]
---

## 📱 Beautiful Knowledge Card

<div style="text-align: center; margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 15px;">
  <h3 style="color: #333; margin-bottom: 15px;">🧊 TRELLIS.2 Knowledge Card</h3>
  <p style="color: #666; margin-bottom: 20px;">Microsoft's open-source 4B-parameter image-to-3D generation model, capable of producing PBR-textured assets at resolutions up to 1536³</p>
  <a href="https://github.com/microsoft/TRELLIS.2" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0078D4 0%, #00B4D8 100%); color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; transition: all 0.3s ease;">
    🎯 View the Project Repository →
  </a>
</div>

---

## 1. Project Description

### 1.1 What Is TRELLIS.2?

**TRELLIS.2** is an open-source 3D generation model released by Microsoft Research, featuring **4 billion parameters (4B)** and dedicated to generating high-quality 3D assets from a single image. It is one of the most advanced **Image-to-3D** generation models in the industry today, capable of producing complete PBR (Physically Based Rendering) textured 3D models at resolutions up to **1536³**.

TRELLIS.2's core innovation lies in introducing **O-Voxel** (Omni-Voxel), a brand-new "field-free" sparse voxel representation, together with its companion **SC-VAE** (Sparse Compression VAE) compression and encoding scheme. These two technologies jointly solve the long-standing pain points of traditional 3D generation models in handling complex topology and rich material properties.

### 1.2 Core Features Overview

| Feature | Details |
|------|------|
| **Parameter Scale** | 4B (4 billion parameters) |
| **Input** | Single image |
| **Output Resolution** | 512³ / 1024³ / 1536³ |
| **Generation Time (H100)** | 3s (512³) / 17s (1024³) / 60s (1536³) |
| **Material Support** | Base Color, Roughness, Metallic, Opacity |
| **Topology Support** | Arbitrary topology, including open surfaces, non-manifold geometry, and internal enclosed structures |
| **License** | MIT License |
| **Project URL** | https://github.com/microsoft/TRELLIS.2 |
| **Paper** | arXiv:2512.14692 |
| **Model Download** | Hugging Face: microsoft/TRELLIS.2-4B |
| **Online Demo** | Hugging Face Spaces |

### 1.3 Why Is TRELLIS.2 Important?

Before TRELLIS.2, 3D generation models faced two core challenges:

1. **Topology limitations**: Methods based on implicit fields (Implicit Field / Iso-surface) cannot handle complex topologies such as open surfaces, non-manifold geometry, and internal structures.
2. **Impoverished materials**: Most models generate only basic color textures and cannot model PBR material properties (roughness, metallic, opacity, etc.).

TRELLIS.2 solves both problems simultaneously through the O-Voxel representation and the sparse compression VAE, taking generated 3D assets to new heights in both geometric complexity and material richness.

---

## 2. Detailed Tutorial

### Step 1: Environment Preparation

TRELLIS.2 currently supports only **Linux** systems and requires the following hardware and software environment:

**Hardware requirements:**
- NVIDIA GPU with at least 24GB VRAM (verified on A100 and H100)

**Software requirements:**
- CUDA Toolkit 12.4 (recommended version)
- Conda (recommended for managing dependencies)
- Python 3.8 or higher

### Step 2: Installing Dependencies

```bash
# Clone the repository (including submodules)
git clone -b main https://github.com/microsoft/TRELLIS.2.git --recursive
cd TRELLIS.2

# Create a conda environment and install all dependencies
. ./setup.sh --new-env --basic --flash-attn --nvdiffrast --nvdiffrec --cumesh --o-voxel --flexgemm
```

**Installation options:**

| Option | Description |
|------|------|
| `--new-env` | Create a new conda environment named `trellis2` |
| `--basic` | Install base dependencies |
| `--flash-attn` | Install the Flash Attention backend (recommended) |
| `--nvdiffrast` | Install the NVIDIA diff rasterizer (for rendering) |
| `--nvdiffrec` | Install the split-sum renderer (for PBR materials) |
| `--cumesh` | Install the CUDA-accelerated mesh tools |
| `--o-voxel` | Install the O-Voxel core library |
| `--flexgemm` | Install the sparse convolution implementation |

**Notes:**
- If your GPU does not support Flash Attention (e.g., V100), you can install `xformers` and set `ATTN_BACKEND=xformers`
- If the system has multiple CUDA Toolkit versions, set `CUDA_HOME` in advance
- The installation process may take a long time; please be patient

### Step 3: Downloading the Pretrained Model

Download the pretrained TRELLIS.2-4B model from Hugging Face:

```bash
# Model link: https://huggingface.co/microsoft/TRELLIS.2-4B
# Download using huggingface-cli
huggingface-cli download microsoft/TRELLIS.2-4B --local-dir ./checkpoints
```

### Step 4: Running Image-to-3D Generation

#### Minimal Example Code

```python
import os
os.environ['OPENCV_IO_ENABLE_OPENEXR'] = '1'
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"  # Save GPU memory

import cv2
import imageio
from PIL import Image
import torch
from trellis2.pipelines import Trellis2ImageTo3DPipeline
from trellis2.utils import render_utils
from trellis2.renderers import EnvMap
import o_voxel

# 1. Set the environment map (for PBR rendering)
envmap = EnvMap(torch.tensor(
    cv2.cvtColor(cv2.imread('assets/hdri/forest.exr', cv2.IMREAD_UNCHANGED), cv2.COLOR_BGR2RGB),
    dtype=torch.float32, device='cuda'
))

# 2. Load the pipeline
pipeline = Trellis2ImageTo3DPipeline.from_pretrained("microsoft/TRELLIS.2-4B")
pipeline.cuda()

# 3. Load the image and run generation
image = Image.open("assets/example_image/T.png")
mesh = pipeline.run(image)[0]
mesh.simplify(16777216)  # nvdiffrast limit

# 4. Render the video
video = render_utils.make_pbr_vis_frames(render_utils.render_video(mesh, envmap=envmap))
imageio.mimsave("sample.mp4", video, fps=15)

# 5. Export to GLB format
glb = o_voxel.postprocess.to_glb(
    vertices=mesh.vertices,
    faces=mesh.faces,
    attr_volume=mesh.attrs,
    coords=mesh.coords,
    attr_layout=mesh.layout,
    voxel_size=mesh.voxel_size,
    aabb=[[-0.5, -0.5, -0.5], [0.5, 0.5, 0.5]],
    decimation_target=1000000,
    texture_size=4096,
    remesh=True,
    remesh_band=1,
    remesh_project=0,
    verbose=True
)
glb.export("sample.glb", extension_webp=True)
```

**Output files:**
- `sample.mp4`: a visualization video of the 3D asset with PBR materials and environment lighting
- `sample.glb`: a PBR-ready GLB file of the 3D asset

**⚠️ Transparency notes:**
`.glb` files are exported in `OPAQUE` mode by default. Although the alpha channel is saved in the texture maps, it is not activated by default. To enable transparency, you need to manually connect the alpha channel of the texture to the opacity/transparency input of the material in a 3D application.

### Step 5: Running the Web Demo

```bash
python app.py
```

After running, open the URL displayed in the terminal to access the web interface, where you can upload an image and generate a 3D asset.

### Step 6: PBR Texture Generation

TRELLIS.2 also supports generating PBR textures for existing 3D shapes:

```bash
# Run the texture generation demo
python app_texturing.py
```

For detailed usage, refer to `example_texturing.py`.

### Step 7: Training Custom Models

TRELLIS.2 provides complete training code, supporting training from scratch or fine-tuning on custom datasets.

#### Data Preparation

Before training, you need to convert the raw 3D assets into the O-Voxel representation, including mesh conversion, compact structured latent generation, and metadata preparation. For a detailed guide, refer to `data_toolkit/README.md`.

#### Training the SC-VAE (Shape Encoder)

```bash
python train.py \
  --config configs/scvae/shape_vae_next_dc_f16c32_fp16.json \
  --output_dir results/shape_vae_next_dc_f16c32_fp16 \
  --data_dir '{"ObjaverseXL_sketchfab": {"base": "datasets/ObjaverseXL_sketchfab", "mesh_dump": "datasets/ObjaverseXL_sketchfab/mesh_dumps", "dual_grid": "datasets/ObjaverseXL_sketchfab/dual_grid_256", "asset_stats": "datasets/ObjaverseXL_sketchfab/asset_stats"}}'
```

#### Training the Flow Model (Generation Model)

```bash
# Shape flow model
python train.py \
  --config configs/gen/slat_flow_img2shape_dit_1_3B_512_bf16.json \
  --output_dir results/slat_flow_img2shape_dit_1_3B_512_bf16 \
  --data_dir '{"ObjaverseXL_sketchfab": {"base": "datasets/ObjaverseXL_sketchfab", "shape_latent": "datasets/ObjaverseXL_sketchfab/shape_latents/shape_enc_next_dc_f16c32_fp16_512", "render_cond": "datasets/ObjaverseXL_sketchfab/renders_cond"}}'

# Texture flow model
python train.py \
  --config configs/gen/slat_flow_imgshape2tex_dit_1_3B_512_bf16.json \
  --output_dir results/slat_flow_imgshape2tex_dit_1_3B_512_bf16 \
  --data_dir '{"ObjaverseXL_sketchfab": {"base": "datasets/ObjaverseXL_sketchfab", "shape_latent": "datasets/ObjaverseXL_sketchfab/shape_latents/shape_enc_next_dc_f16c32_fp16_512", "pbr_latent": "datasets/ObjaverseXL_sketchfab/pbr_latents/tex_enc_next_dc_f16c32_fp16_512", "render_cond": "datasets/ObjaverseXL_sketchfab/renders_cond"}}'
```

#### Training Parameters

| Parameter | Description |
|------|------|
| `--config` | Experiment configuration file path |
| `--output_dir` | Training output directory |
| `--load_dir` | Checkpoint loading directory (defaults to output_dir) |
| `--ckpt` | Checkpoint step to resume training from |
| `--data_dir` | Dataset path (JSON string format) |
| `--auto_retry` | Number of automatic retries after failure |
| `--tryrun` | Dry run, without actually training |
| `--profile` | Enable training performance profiling |
| `--num_nodes` | Number of nodes for distributed training |
| `--node_rank` | Rank of the current node |
| `--num_gpus` | Number of GPUs per node (default: all) |

---

## 3. Core Innovations and In-Depth Technical Analysis

### 3.1 O-Voxel: Omni-Directional Voxel Representation

O-Voxel is TRELLIS.2's most core innovation. It is a "field-free" sparse voxel structure that can simultaneously encode precise geometry and complex material appearance.

**The two major components of O-Voxel:**

#### GEO (Geometry Part)
- Uses the **Flexible Dual Grids** representation
- Can handle arbitrary topology, including:
  - ✅ Open surfaces (such as clothing, leaves)
  - ✅ Non-manifold geometry
  - ✅ Internal enclosed structures
- Preserves the precise representation of sharp edges

#### MAT (Material Part)
- Supports the full set of PBR properties:
  - **Base Color**
  - **Roughness**
  - **Metallic**
  - **Opacity**
- Enables physically accurate rendering and relighting

### 3.2 SC-VAE: Sparse Compression VAE

SC-VAE (Sparse Compression VAE) adopts a sparse residual auto-encoding scheme that directly compresses the voxel data:

- **16× spatial downsampling**: compresses high-resolution voxels into a compact latent space
- **~9.6K latent tokens**: for a 1024³ asset, only about 9,600 latent tokens are needed
- **Negligible perceptual degradation**: reconstruction quality after compression is almost lossless
- **Efficient large-scale generative modeling**: the compact latent space makes training a 4B-parameter generation model possible

### 3.3 Three-Stage Generation Pipeline

TRELLIS.2's generation pipeline is divided into three stages:

1. **Stage 1: Shape Generation** (Image → Shape Latent)
   - Generates structured shape latents from the input image
   - Uses an image-conditioned DiT (Diffusion Transformer) model

2. **Stage 2: Shape-to-Texture** (Shape Latent → Texture Latent)
   - Generates structured material latents based on the shape latents
   - Ensures consistency between the texture and the geometric shape

3. **Stage 3: Latent Decoding** (Latent → O-Voxel → Mesh)
   - Decodes the structured latents into the O-Voxel representation
   - Converts into a renderable textured mesh via the O-Voxel library

### 3.4 Performance Data

| Resolution | Total Time | Shape Generation | Material Generation |
|--------|--------|----------|----------|
| 512³ | ~3s | 2s | 1s |
| 1024³ | ~17s | 10s | 7s |
| 1536³ | ~60s | 35s | 25s |

*Test environment: NVIDIA H100 GPU*

---

## 4. Key Viewpoints and Conclusions

### Viewpoint 1: O-Voxel Is a Paradigm Shift for 3D Representation

Traditional 3D generation models rely on implicit fields (Implicit Field) and iso-surface extraction for geometry, an approach that is inherently topology-limited. As a "field-free" sparse voxel representation, O-Voxel fundamentally breaks this limitation. It is not an incremental improvement over existing methods, but a brand-new paradigm for 3D data representation — encoding geometry and materials directly in voxel units, rather than representing them indirectly through field functions.

**Core conclusion**: O-Voxel proves that sparse voxel representations can handle arbitrary topology and rich materials while maintaining a high compression ratio — an important paradigm shift in the field of 3D generation.

### Viewpoint 2: Compactness and Fidelity Can Be Achieved Together

TRELLIS.2's SC-VAE achieves a 16× spatial compression ratio, compressing 1024³ voxel data into only ~9.6K latent tokens, with almost negligible perceptual degradation in reconstruction quality. This is an important balance point in the 3D generation field — high compression ratios in the past usually came at the cost of significant quality loss.

**Core conclusion**: Through a carefully designed sparse residual auto-encoding scheme, high compression ratios can be achieved without sacrificing perceptual quality, opening up new possibilities for training and deploying large-scale 3D generation models.

### Viewpoint 3: Native 3D VAE Beats 2D Projection Methods

TRELLIS.2 uses a VAE learned from native 3D data, rather than projecting 3D assets onto 2D views and then generating. The advantages of a native 3D VAE are:
- Directly learns structural information in 3D space
- Avoids the information loss caused by 2D projection
- Handles multi-view consistency better
- Supports true 3D operations (such as rotation and scaling)

**Core conclusion**: Learning native 3D representations is the right direction for achieving high-quality 3D generation, and TRELLIS.2's experimental results validate this design philosophy.

### Viewpoint 4: The DiT Architecture Excels in 3D Generation

TRELLIS.2 uses a vanilla DiT (Diffusion Transformer) as its generation architecture, rather than a more complex custom design. The 4B-parameter DiT model demonstrates outstanding performance on 3D generation tasks, suggesting that:
- DiT's generality is sufficient to support 3D generation tasks
- There is no need to design complex architectures specifically for 3D data
- Scaled Transformer architectures are equally effective in the 3D domain

**Core conclusion**: DiT's simplicity and scalability make it an ideal choice for 3D generation models, and TRELLIS.2's success further validates this trend.

### Viewpoint 5: PBR Material Generation Is the Missing Key Piece in 3D Generation

Before TRELLIS.2, most 3D generation models output only base color textures, lacking PBR material properties. TRELLIS.2 simultaneously models Base Color, Roughness, Metallic, and Opacity, enabling generated assets to be rendered physically accurately under any lighting conditions.

**Core conclusion**: PBR material generation is a key step in moving 3D generation from "proof of concept" to "production-ready," and TRELLIS.2 has made a pioneering contribution in this dimension.

### Viewpoint 6: An Efficient Processing Pipeline Lowers the Barrier to Entry

TRELLIS.2's data processing pipeline is completely **render-agnostic** and **optimization-agnostic**:
- Textured Mesh → O-Voxel: < 10s (single CPU)
- O-Voxel → Textured Mesh: < 100ms (CUDA)

This minimal processing pipeline means users do not need complex preprocessing or postprocessing steps to complete the generation and use of 3D assets.

**Core conclusion**: A minimal processing pipeline is an important factor in technology adoption, and TRELLIS.2 fully considered real-world ease of use in its design.

### Viewpoint 7: The Open-Source Strategy Democratizes 3D Generation Technology

TRELLIS.2 is released under the MIT license, with model weights publicly available on Hugging Face. This open-source strategy:
- Lowers the barrier to entry for 3D generation technology
- Promotes broad adoption by academia and industry
- Provides a solid foundation for subsequent research and improvement

**Core conclusion**: Microsoft's open-source strategy shows that 3D generation technology is moving from closed research projects toward an open ecosystem, which will accelerate the development of the entire field.

---

## 5. Design Philosophy

### 5.1 A "Native 3D" First Design Philosophy

The core of TRELLIS.2's design philosophy is **"Native 3D"** — from data representation to model architecture, everything is oriented toward native 3D thinking, rather than reducing 3D problems to 2D and solving them there.

This philosophy is reflected in three layers:
1. **Data layer**: uses O-Voxel as the native 3D representation, rather than implicit fields or 2D projections
2. **Model layer**: designs the Sparse Compression VAE to directly process 3D voxel data
3. **Generation layer**: uses Flow Matching to generate in the 3D latent space

### 5.2 Compactness as Elegance

TRELLIS.2's design philosophy emphasizes that **compactness** is an aesthetic pursuit:
- 16× spatial compression is not a compromise, but a design goal
- The compact latent space makes large-scale generation model training possible
- Efficient inference makes real-time or near-real-time 3D generation a reality

This "compactness as elegance" philosophy holds that a good representation should be as compact as possible while preserving complete information — just as good data compression should minimize size while maintaining quality.

### 5.3 Sparsity as Efficiency

The "sparse" nature of O-Voxel is the core source of TRELLIS.2's efficiency:
- Not all voxels need to be stored and computed
- Sparse structures are naturally suited to parallel processing on GPUs
- FlexGEMM (a Triton-based sparse convolution implementation) further accelerates sparse computation

The design philosophy holds that **sparsity is not a stopgap measure, but an intrinsic property of 3D data** — most space is empty (with no geometry or materials), so sparse representations should be used to encode and process it efficiently.

### 5.4 End-to-End Optimization

TRELLIS.2 adopts an end-to-end optimization strategy:
- From the O-Voxel representation, to SC-VAE encoding, to Flow Matching generation, all components are jointly optimized
- No separate preprocessing or postprocessing steps introduce information loss
- The entire pipeline is a unified optimization objective

This end-to-end design philosophy avoids the global suboptimality caused by independently optimizing each component in traditional pipelines.

### 5.5 Pragmatism-Driven

TRELLIS.2's design reflects a strong pragmatism orientation:
- **Render-agnostic** data processing: does not depend on a specific rendering pipeline
- **Optimization-agnostic** postprocessing: no complex mesh optimization steps required
- **Instant conversion**: bidirectional conversion completes in seconds
- **MIT license**: fully open, no usage restrictions

This pragmatism means TRELLIS.2 is not just a research prototype, but a tool that can actually be put to use in production.

### 5.6 Modularity and Extensibility

TRELLIS.2's architecture design fully takes modularity into account:
- **O-Voxel library**: a standalone mesh conversion library that can be reused by other projects
- **FlexGEMM**: a general sparse convolution implementation that does not depend on TRELLIS.2
- **CuMesh**: an independent set of CUDA mesh tools
- **Configurable SC-VAE**: supports configurations with different resolutions and compression ratios

This modular design allows TRELLIS.2's individual components to be used and extended independently, providing flexible infrastructure for subsequent research.

---

## 6. Implications for Future 3D Generation

### 6.1 Sparse Voxel Representations Will Become Mainstream

TRELLIS.2's success proves the enormous potential of sparse voxel representations in 3D generation. In the future, we expect:
- More models will adopt sparse voxel or similar representations
- Sparse computation optimization will become a standard component of 3D generation
- Innovative representations like O-Voxel will continue to emerge

### 6.2 Native 3D Learning Will Replace 2D Projection Methods

TRELLIS.2 demonstrates the quality and efficiency advantages of native 3D VAEs. In the future:
- 2D projection methods will gradually be replaced by native 3D methods
- Multi-view consistency will be naturally modeled through the 3D latent space
- 3D operations (rotation, scaling, editing) will become more natural and efficient

### 6.3 PBR Material Generation Will Become Standard

With TRELLIS.2 proving the feasibility of PBR material generation, in the future:
- Material generation will become a standard feature of 3D generation models
- Richer material properties (such as subsurface scattering and anisotropy) will be modeled
- Generated assets will be directly usable in production rendering pipelines

### 6.4 Greater Scale and Higher Efficiency Coexist

TRELLIS.2 demonstrates that a 4B-parameter model can reach SOTA quality while maintaining efficient inference. In the future:
- Larger models will emerge, but maintain efficiency through sparsification and quantization
- Distillation and compression techniques will allow large models to run on consumer hardware
- Real-time or near-real-time 3D generation will become possible

---

## 7. Practical Advice for Developers

### Recommended Toolchain

1. **TRELLIS.2**: the core 3D generation model
2. **O-Voxel**: the mesh conversion library
3. **FlexGEMM**: sparse convolution acceleration
4. **CuMesh**: CUDA mesh postprocessing tools
5. **Hugging Face Spaces**: online demo (no local deployment needed)

### Getting Started

1. **Check the demo first**: try the online demo on Hugging Face Spaces to see the generation quality
2. **Deploy locally**: follow the README to set up a local environment and run the minimal example
3. **Understand O-Voxel**: dive into the principles and advantages of the O-Voxel representation
4. **Try fine-tuning**: fine-tune the model on custom datasets to explore domain-specific 3D generation
5. **Join the community**: submit issues or PRs on GitHub to participate in the project's development

### Cost Control Advice

- Use the free online demo on Hugging Face Spaces for initial testing
- Local deployment requires an NVIDIA GPU (at least 24GB VRAM)
- Training custom models requires substantial GPU time; cloud GPU instances are recommended
- Inference takes about 3–60 seconds on an H100, and will be significantly slower on consumer GPUs

---

## 8. References

- [TRELLIS.2 GitHub Repository](https://github.com/microsoft/TRELLIS.2)
- [Project Page](https://microsoft.github.io/TRELLIS.2/)
- [Research Paper (arXiv)](https://arxiv.org/abs/2512.14692)
- [Hugging Face Model](https://huggingface.co/microsoft/TRELLIS.2-4B)
- [Hugging Face Spaces Demo](https://huggingface.co/spaces/microsoft/TRELLIS.2)
- [O-Voxel Package](https://github.com/microsoft/TRELLIS.2/tree/main/o-voxel)
- [FlexGEMM](https://github.com/JeffreyXiang/FlexGEMM)
- [CuMesh](https://github.com/JeffreyXiang/CuMesh)

---

*This article is compiled, translated, and analyzed based on Microsoft TRELLIS.2's official documentation, GitHub README, arXiv paper, and project homepage content.*
