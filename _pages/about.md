---
permalink: /
title: ""
excerpt: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "https://cdn.jsdelivr.net/gh/" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<span class='anchor' id='about-me'></span>

My name is Tianhao Zhao(赵天豪), a PhD Student at the School of Computer Science and Technology, Huazhong University of Science and Technology, in the [HUST Media Lab](https://media.hust.edu.cn/index.htm), advised by [Prof. Wei Yang](https://weiyang-hust.github.io). My research interest includes 3D mesh generation and diffusion.


Apart from my research, I enjoy playing Valorant, where I often take on the role of the in-game leader (IGL)😂😂😂.
<!-- My research interest includes neural machine translation and computer vision. I have published more than 100 papers at the top international AI conferences with total <a href='https://scholar.google.com/citations?user=DhtAFkwAAAAJ'>google scholar citations <strong><span id='total_cit'>260000+</span></strong></a> (You can also use google scholar badge <a href='https://scholar.google.com/citations?user=DhtAFkwAAAAJ'><img src="https://img.shields.io/endpoint?url={{ url | url_encode }}&logo=Google%20Scholar&labelColor=f6f6f6&color=9cf&style=flat&label=citations"></a>). -->


# 🔥 News
- *2026.05*: &nbsp;🎉🎉 My first paper "LATO: 3D Mesh Flow Matching with Structured TOpology Preserving LAtents" was received by ICML2026.

# 📝 Publications 
**Equal contribution⋆  Corresponding author$\dagger$**
<div class='paper-box'><div class='paper-box-image'><div><div class="badge">arXiv 2026</div><img src='images/lato2.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[LATO.2: Factorized 3D Mesh Generation with Vertex and Topology Flow](https://arxiv.org/abs/2607.10623)

Hang Long\*, **Tianhao Zhao**\*, Junkai Lin, Youjia Zhang, Huipeng Guo, Rendong Liang, Jiale Xu, Jozef Hladký, Matthias Nießner, Yuanming Hu, Wei Yang$\dagger$

[**Paper**](https://arxiv.org/abs/2607.10623) \| [**Code**](https://github.com/LoHhhha/LATO.2)
-  We present LATO.2, a factorized flow matching framework that splits mesh generation into a vertex flow followed by a vertex-conditioned connectivity flow over a shared voxel scaffold, enabling part-wise high-resolution synthesis and topology-adaptive editing.
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">ICML 2026</div><img src='images/lato.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[LATO: 3D Mesh Flow Matching with Structured TOpology Preserving LAtents](https://arxiv.org/pdf/2603.06357)

**Tianhao Zhao**\*, Youjia Zhang\*, Hang Long, Jinshen Zhang, Wenbing Li, Yang Yang, Gongbo Zhang, Jozef Hladký, Matthias Nießner, Wei Yang$\dagger$

[**Paper**](https://arxiv.org/pdf/2603.06357) \| [**Project Page**](https://tianhaozhao668.github.io/LATO/) \| [**Code**](https://github.com/TianhaoZhao668/LATO) <strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong>
-  We introduce LATO, a novel topology-preserving latent representation that enables scalable, flow matching-based synthesis of explicit 3D meshes.  
</div>
</div>


# 🎖 Honors and Awards
- 2021 National Scholarship
- 2021 Outstanding Undergraduates in Term of Academic Performance (Top 1%)
- 2024 Outstanding Graduate Students


# 📖 Educations
- *Sept 2020 - June. 2024*, Undergraduate, Huazhong University of Science and Technology. 
- *Sept. 2024 - Present*, PhD, Huazhong University of Science and Technology.

# 💬 Invited Talks
- Mar. 2026: Invited Talk for Meshy. 
<!-- - *2021.03*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet.  \| [\[video\]](https://github.com/) -->

# 💻 Internships
- *2026.05 - Present*, Generative AI researcher intern, Meshy.