---
title: "AI Knowledge Graph: Transform Unstructured Documents into Interactive Knowledge Graphs"
date: "2026-08-13"
description: "A deep dive into the AI Knowledge Graph Generator project - learn how to convert unstructured text documents into interactive knowledge graphs"
tags: ["AI", "Knowledge Graph", "NLP", "Python", "Visualization"]
categories: ["AI & ML"]
author: "robert-mcdermott"
image: "/assets/blog/ai-knowledge-graph/overview.png"
---

# AI Knowledge Graph: Transform Unstructured Documents into Interactive Knowledge Graphs

In the age of information explosion, we deal with massive amounts of unstructured text daily. Research papers, technical documents, corporate reports, countless books — all contain valuable knowledge, yet they scatter like puzzle pieces, making it difficult to see the big picture. How do we extract valuable information from unstructured text and present the relationships between concepts intuitively? The **AI Knowledge Graph Generator** project offers an elegant solution.

## Project Overview

**AI Knowledge Graph Generator** is an open-source project by developer [robert-mcdermott](https://github.com/robert-mcdermott), currently garnering **2.8k Stars** and **388 Forks** on GitHub, released under the **Apache-2.0** license.

The core functionality of this project is transforming any unstructured text document into an **interactive knowledge graph**, enabling users to visually explore entities, concepts, and their relationships within documents.

### Key Features

- **Broad Compatibility**: Supports any OpenAI-compatible API endpoint, including Ollama, LM Studio, OpenAI, vLLM, and LiteLLM
- **Smart Text Chunking**: Automatically splits large documents into overlapping chunks suitable for LLM context processing
- **SPO Triple Extraction**: Extracts Subject-Predicate-Object triples from each text chunk
- **Entity Canonicalization**: Ensures consistent entity naming across document chunks
- **Relation Inference**: Automatically discovers transitive relationships between disconnected components
- **Interactive Visualization**: Generates beautiful interactive HTML visualizations using PyVis

## Core Design Philosophy

### Why Knowledge Graphs?

Traditional text reading faces several core challenges:

1. **Information Fragmentation**: Key information in long documents is scattered throughout, making it difficult to grasp the full picture quickly
2. **Implicit Relationships**: Relationships between entities are often hidden within sentences, not easily discovered visually
3. **Knowledge Silos**: Connections between different documents are often overlooked

Knowledge graphs decompose text into **Entities** and **Relations**, stored in a graph structure, enabling us to:

- See the core content of documents at a glance
- Quickly identify connections between different concepts
- Discover hidden connections through graph traversal

### SPO Triples: The Atomic Representation of Knowledge

SPO (Subject-Predicate-Object) triples are the foundation of knowledge representation. Any knowledge can be decomposed into a subject, a predicate, and an object.

For example, from the text "*Python is a programming language created by Guido van Rossum*", we can extract:

- **Subject**: Python
- **Predicate**: created by
- **Object**: Guido van Rossum

This representation is both simple and powerful, transforming the rich expressions of natural language into machine-processable knowledge units, laying the foundation for subsequent reasoning and querying.

## Detailed Workflow

The AI Knowledge Graph Generator processing flow consists of five core stages:

### Stage 1: Document Chunking

Long documents are split into overlapping chunks suitable for the LLM context window size.

```
Original Document → Overlapping Chunk 1 → Overlapping Chunk 2 → Overlapping Chunk 3 → ...
```

Key parameters for chunking strategy:
- **Chunk Size**: Number of tokens in each chunk
- **Overlap**: Overlap ratio between adjacent chunks

This overlapping design ensures that entities and relationships at boundaries are not cut off, guaranteeing the completeness of knowledge extraction.

### Stage 2: SPO Triple Extraction

For each text chunk, the system calls the LLM to identify and extract SPO triples.

```
Input: "Apple released iPhone 15, featuring A16 chip"

Output:
- (Apple, released, iPhone 15)
- (iPhone 15, features, A16 chip)
```

This stage is the core of the entire process; the LLM prompt design directly affects extraction quality.

### Stage 3: Entity Canonicalization

Due to chunking, the same entity may appear with different expressions in different chunks.

For example:
- "Python" vs "Python programming language"
- "Guido van Rossum" vs "Guido"

The entity canonicalization stage uses LLM-assisted **entity alignment and resolution** to ensure the same entity uses unified naming, avoiding redundancy and ambiguity in the knowledge graph.

### Stage 4: Relation Inference

Based on extracted triples, the system automatically infers transitive relationships between disconnected components.

For example:
- Given: (A, located in, B) and (B, located in, C) → Inferred: (A, located in, C)
- Given: (X, is, Y) and (Y, contains, Z) → Inferred: (X, contains, Z)

This transitive inference greatly enhances the connectivity of the knowledge graph, surfacing implicit knowledge.

### Stage 5: Interactive Visualization

The final knowledge graph uses the **PyVis** library to generate interactive HTML visualizations.

PyVis is a Python library based on vis.js, specifically for creating network graph visualizations. The generated HTML files can be opened in any modern browser and support rich interactive features.

## Visualization Features

The generated interactive knowledge graph has the following visual features:

### Community Detection and Color Coding

Uses the **Louvain method** for community detection. Nodes with close associations are classified into the same community and marked with the same color.

This allows you to instantly identify the main topic clusters in the knowledge graph.

### Node Size and Importance

Node size is based on multiple importance metrics:
- **Degree Centrality**: The more edges directly connected to a node, the larger the node
- **Betweenness Centrality**: How often this node serves as a bridge connecting other nodes
- **Eigenvector Centrality**: A comprehensive metric considering the importance of neighboring nodes

### Visual Distinction of Edges

- **Solid lines**: Original relationships directly extracted from the text
- **Dashed lines**: Transitive relationships automatically inferred by the system

This distinction helps users distinguish between "verified facts" and "inferred conclusions".

### Interactive Controls

The visualization interface supports complete interactive operations:

| Operation | Function |
|-----------|----------|
| Zoom | Mouse wheel or trackpad to zoom the view |
| Pan | Drag canvas to move the view |
| Hover | Mouse hover to show detailed node/edge information |
| Filter | Filter display by type, weight, and other conditions |
| Physics Control | Adjust attraction and repulsion between nodes |

### Theme Support

Provides **light** and **dark** themes to suit different usage environments and personal preferences.

## Detailed Installation and Configuration Tutorial

### Environment Requirements

- Python 3.8+
- OpenAI-compatible API (local or cloud)

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/robert-mcdermott/ai-knowledge-graph
cd ai-knowledge-graph

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure API endpoint
export OPENAI_API_BASE="http://localhost:11434/v1"  # Ollama example
export OPENAI_API_KEY="your-api-key"  # Can be any value for local Ollama
```

### Ollama Local Model Configuration (Recommended)

If you want to run locally, Ollama is recommended:

```bash
# Install Ollama
# macOS/Linux: https://ollama.ai
# Windows: Via WSL or Docker

# Download model
ollama pull llama3.2

# Start Ollama service (default port 11434)
ollama serve

# Configure environment variables
export OPENAI_API_BASE="http://localhost:11434/v1"
export OPENAI_API_KEY="ollama"  # Ollama doesn't need a real key
```

### Quick Start

```bash
# Basic usage
python generate-graph.py --input your_text_file.txt --output knowledge_graph.html

# Using local model
python generate-graph.py \
    --input research_paper.txt \
    --output knowledge_graph.html \
    --api-base http://localhost:11434/v1 \
    --model llama3.2

# Specify chunking parameters
python generate-graph.py \
    --input large_document.txt \
    --output knowledge_graph.html \
    --chunk-size 1000 \
    --overlap 200
```

## Usage Examples and Best Practices

### Example 1: Research Paper Analysis

```bash
# Download an arXiv paper and extract knowledge graph
curl -s https://arxiv.org/pdf/2301.XXXXX.pdf | pdftotext - | \
python generate-graph.py \
    --input /dev/stdin \
    --output paper_graph.html \
    --chunk-size 800
```

### Example 2: Technical Documentation Analysis

```bash
# Analyze project README
python generate-graph.py \
    --input /path/to/project/README.md \
    --output readme_graph.html

# Analyze multiple documents (via merging)
cat doc1.md doc2.md doc3.md > combined.txt
python generate-graph.py \
    --input combined.txt \
    --output combined_graph.html
```

### Best Practices

1. **Choose the Right Model**
   - Local deployment: Llama 3.2, Qwen 2.5 (balanced speed and quality)
   - Cloud API: GPT-4o, Claude 3.5 (higher precision)

2. **Adjust Chunk Size**
   - Academic papers: 600-1000 tokens (maintain complete sentences)
   - Technical documents: 800-1200 tokens
   - Conversation records: 200-400 tokens

3. **Post-processing Optimization**
   - Import generated JSON into graph databases (e.g., Neo4j)
   - Use Gephi for more advanced graph analysis

4. **Iterative Improvement**
   - Test with small samples first to check extraction quality
   - Adjust prompts or chunking parameters based on results

## Key Takeaways

### Core Value of Knowledge Graphs

1. **Structured**: Transform unstructured text into queryable graph data
2. **Connected**: Reveal implicit relationships between concepts
3. **Explorable**: Dig deep into knowledge through interactive interfaces

### Technical Highlights

- **LLM-driven Extraction**: Leverage large language models for natural language understanding
- **Flexible Compatibility**: Support any OpenAI-compatible endpoint
- **Automated Reasoning**: Infer unknown relationships from known knowledge
- **Beautiful Visualization**: PyVis-powered interactive charts

### Applicable Scenarios

- Academic literature review and knowledge management
- Enterprise internal knowledge base construction
- Code repository structure analysis
- Legal document relationship mapping
- Market competitive intelligence analysis

## Conclusion

AI Knowledge Graph Generator demonstrates an elegant path for transforming unstructured text into structured knowledge. It combines the language understanding capabilities of LLMs with the data representation advantages of graph structures, providing entirely new possibilities for knowledge management.

Whether you're a researcher wanting to organize literature relationships, an engineer wanting to understand code architecture, or an analyst wanting to mine insights from documents, this tool is worth trying.

**Project URL**: [https://github.com/robert-mcdermott/ai-knowledge-graph](https://github.com/robert-mcdermott/ai-knowledge-graph)

**Stars**: 2.8k | **Forks**: 388 | **License**: Apache-2.0

---

*If you find this project helpful, consider giving the author a Star on GitHub!*
