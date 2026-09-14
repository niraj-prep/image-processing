export interface Operation {
  id: string;
  name: string;
  description?: string;
}

export interface VivaQuestion {
  question: string;
  answer: string;
}

export interface ExperimentData {
  id: string;
  number: number;
  type: 'practical' | 'postlab';
  title: string;
  shortTitle: string;
  description: string;
  objective: string;
  operations: Operation[];
  operationChips: string[];
  tags: string[];
  aim: string;
  theory: string;
  algorithm: string[];
  parameters: string;
  result: string;
  conclusion: string;
  vivaQuestions: VivaQuestion[];
  pythonCode: string;
  icon: string;
}

export const practicals: ExperimentData[] = [
  {
    id: 'practical-1',
    number: 1,
    type: 'practical',
    title: 'Image Representation & Basic Operations',
    shortTitle: 'Image Representation & Basic Ops',
    description: 'Pixel matrix structures, channel extraction, arithmetic blending.',
    objective: 'To understand digital image representation in memory and perform basic arithmetic and bitwise operations on images using OpenCV.',
    operations: [
      { id: 'rgb-gray', name: 'RGB ↔ Grayscale', description: 'Convert between color and grayscale representations' },
      { id: 'add', name: 'Add', description: 'Pixel-wise addition of two images' },
      { id: 'subtract', name: 'Subtract', description: 'Pixel-wise subtraction of two images' },
      { id: 'multiply', name: 'Multiply', description: 'Pixel-wise multiplication' },
      { id: 'divide', name: 'Divide', description: 'Pixel-wise division' },
      { id: 'and', name: 'Bitwise AND', description: 'Logical AND between pixel values' },
      { id: 'or', name: 'Bitwise OR', description: 'Logical OR between pixel values' },
      { id: 'xor', name: 'Bitwise XOR', description: 'Logical XOR between pixel values' },
      { id: 'not', name: 'Bitwise NOT', description: 'Logical NOT (inversion) of pixel values' },
    ],
    operationChips: ['RGB↔Gray', 'Matrix Add', 'Bitwise AND'],
    tags: ['#Verified'],
    aim: 'To study digital image representation formats and perform basic arithmetic and bitwise operations on images.',
    theory: 'A digital image is represented as a 2D matrix of pixel values. For grayscale images, each pixel is a single intensity value (0–255). For color images, each pixel has three channels (B, G, R in OpenCV). Arithmetic operations (add, subtract, multiply, divide) are performed element-wise between corresponding pixels. OpenCV uses saturated arithmetic — values are clipped to [0, 255]. Bitwise operations (AND, OR, XOR, NOT) operate on the binary representation of pixel values and are useful for masking and combining images.',
    algorithm: [
      'Load the input image using cv2.imread()',
      'For grayscale conversion: apply cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)',
      'For arithmetic: use cv2.add(), cv2.subtract(), cv2.multiply(), cv2.divide()',
      'For bitwise: use cv2.bitwise_and(), cv2.bitwise_or(), cv2.bitwise_xor(), cv2.bitwise_not()',
      'Display results using cv2.imshow() or matplotlib',
    ],
    parameters: 'Input images must be of the same dimensions for arithmetic and bitwise operations. The weight/scale factor can be adjusted for blending operations.',
    result: 'Grayscale conversion reduces 3-channel image to single channel. Arithmetic operations produce blended or modified pixel intensities. Bitwise operations produce binary-logic combinations useful for masking.',
    conclusion: 'Basic image operations form the foundation for all image processing. Understanding pixel-level manipulation enables more complex algorithms like filtering, segmentation, and feature extraction.',
    vivaQuestions: [
      { question: 'What is the difference between cv2.add() and the + operator?', answer: 'cv2.add() performs saturated addition (clipping at 255), while the + operator performs modular arithmetic (wraps around on overflow).' },
      { question: 'Why does OpenCV use BGR instead of RGB?', answer: 'Historical reasons — early camera manufacturers and the Windows bitmap format used BGR ordering. OpenCV adopted this convention for compatibility.' },
      { question: 'What is the purpose of bitwise operations in image processing?', answer: 'Bitwise operations are primarily used for masking — extracting or hiding specific regions of an image using binary masks.' },
    ],
    pythonCode: `import cv2
import numpy as np

# Load image
img = cv2.imread('input.jpg')

# RGB to Grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Arithmetic operations (requires two images of same size)
img2 = cv2.imread('input2.jpg')
add_result = cv2.add(img, img2)
sub_result = cv2.subtract(img, img2)
mul_result = cv2.multiply(img, img2, scale=1/255)
div_result = cv2.divide(img, img2, scale=255)

# Bitwise operations
and_result = cv2.bitwise_and(img, img2)
or_result = cv2.bitwise_or(img, img2)
xor_result = cv2.bitwise_xor(img, img2)
not_result = cv2.bitwise_not(img)

cv2.imshow('Result', add_result)
cv2.waitKey(0)`,
    icon: 'grid_on',
  },
  {
    id: 'practical-2',
    number: 2,
    type: 'practical',
    title: '2-D Geometric Transformations',
    shortTitle: '2-D Geometric Transforms',
    description: 'Affine spatial mappings, rotation, interpolation matrices, bilinear mapping.',
    objective: 'To apply 2-D geometric transformations (translation, rotation, scaling, shearing, reflection, cropping) to images using transformation matrices.',
    operations: [
      { id: 'translate', name: 'Translation', description: 'Shift image by X/Y offset' },
      { id: 'rotate', name: 'Rotation', description: 'Rotate image by angle around pivot' },
      { id: 'scale', name: 'Scaling', description: 'Resize image by scale factors' },
      { id: 'shear', name: 'Shearing', description: 'Apply shear transformation' },
      { id: 'reflect', name: 'Reflection', description: 'Flip image horizontally/vertically' },
      { id: 'crop', name: 'Cropping', description: 'Extract region of interest' },
    ],
    operationChips: ['Affine Warp', 'Bilinear Interp', 'Draggable Crop'],
    tags: ['#Affine'],
    aim: 'To implement and visualize 2-D geometric transformations on digital images using OpenCV affine and perspective transform functions.',
    theory: 'Geometric transformations modify the spatial arrangement of pixels in an image. They are represented as matrix operations: Translation uses a 2×3 matrix [1,0,tx; 0,1,ty]. Rotation uses cos/sin matrix with optional pivot. Scaling multiplies coordinates by scale factors. Shearing skews the image along one axis. These are all affine transformations (parallel lines remain parallel). OpenCV applies them using cv2.warpAffine() with the transformation matrix M.',
    algorithm: [
      'Load the input image',
      'Construct the appropriate 2×3 transformation matrix M',
      'For Translation: M = [[1,0,tx],[0,1,ty]]',
      'For Rotation: M = cv2.getRotationMatrix2D(center, angle, scale)',
      'For Scaling: use cv2.resize() with interpolation',
      'Apply: result = cv2.warpAffine(img, M, (cols, rows))',
      'Display original and transformed images',
    ],
    parameters: 'Translation: X/Y offset in pixels. Rotation: angle in degrees, pivot point (default: center). Scaling: X/Y scale factors. Shearing: shear factors for X/Y axes.',
    result: 'Each transformation produces a spatially modified image. Translation shifts, rotation spins, scaling resizes, shearing skews, and reflection mirrors the image.',
    conclusion: 'Geometric transformations are essential for image registration, augmentation, and correction. Understanding affine matrices enables composing complex transformations.',
    vivaQuestions: [
      { question: 'What is the difference between affine and perspective transformation?', answer: 'Affine preserves parallelism (uses 2×3 matrix), while perspective allows non-parallel mapping (uses 3×3 matrix) — e.g., correcting camera angle distortion.' },
      { question: 'Why is interpolation needed during geometric transformations?', answer: 'Transformed coordinates may fall between integer pixel positions. Interpolation (nearest, bilinear, bicubic) estimates the pixel value at non-integer locations.' },
      { question: 'What happens to pixels that map outside the image boundary?', answer: 'They are handled by the border mode — typically filled with zeros (black), replicated from edges, or wrapped around.' },
    ],
    pythonCode: `import cv2
import numpy as np

img = cv2.imread('input.jpg')
rows, cols = img.shape[:2]

# Translation
tx, ty = 100, 50
M_translate = np.float32([[1, 0, tx], [0, 1, ty]])
translated = cv2.warpAffine(img, M_translate, (cols, rows))

# Rotation
angle = 45
center = (cols // 2, rows // 2)
M_rotate = cv2.getRotationMatrix2D(center, angle, 1.0)
rotated = cv2.warpAffine(img, M_rotate, (cols, rows))

# Scaling
scale_x, scale_y = 1.5, 1.5
scaled = cv2.resize(img, None, fx=scale_x, fy=scale_y,
                    interpolation=cv2.INTER_LINEAR)

# Shearing
shear_x = 0.3
M_shear = np.float32([[1, shear_x, 0], [0, 1, 0]])
sheared = cv2.warpAffine(img, M_shear, (cols + int(rows*shear_x), rows))

# Reflection
reflected_h = cv2.flip(img, 1)  # Horizontal
reflected_v = cv2.flip(img, 0)  # Vertical

# Cropping
x, y, w, h = 50, 50, 200, 200
cropped = img[y:y+h, x:x+w]`,
    icon: 'transform',
  },
  {
    id: 'practical-3',
    number: 3,
    type: 'practical',
    title: 'Spatial Domain Image Enhancement',
    shortTitle: 'Spatial Domain Enhancement',
    description: 'Cumulative distribution equalization, contrast stretching.',
    objective: 'To enhance image contrast using histogram equalization, smoothing, sharpening, and thresholding techniques in the spatial domain.',
    operations: [
      { id: 'hist-eq', name: 'Histogram Equalization', description: 'Equalize intensity distribution' },
      { id: 'smooth', name: 'Smoothing', description: 'Reduce noise with averaging' },
      { id: 'sharpen', name: 'Sharpening', description: 'Enhance edges and details' },
      { id: 'threshold', name: 'Thresholding', description: 'Binary segmentation by intensity' },
    ],
    operationChips: ['Hist Eq', 'Contrast Stretch', 'Gamma γ'],
    tags: ['#Clone'],
    aim: 'To implement spatial domain image enhancement techniques including histogram equalization, image smoothing, sharpening, and thresholding.',
    theory: 'Spatial domain enhancement operates directly on pixel values. Histogram equalization redistributes pixel intensities to achieve a uniform distribution, improving contrast. The transformation function is T(r) = (L-1) × CDF(r), where CDF is the cumulative distribution function of pixel intensities. Smoothing reduces noise by averaging neighborhoods. Sharpening enhances edges using Laplacian or unsharp masking. Thresholding converts grayscale to binary using a threshold value T.',
    algorithm: [
      'Load image and convert to grayscale',
      'Compute histogram using cv2.calcHist()',
      'For Histogram Equalization: apply cv2.equalizeHist()',
      'For Smoothing: apply cv2.blur() or cv2.GaussianBlur()',
      'For Sharpening: apply Laplacian kernel or unsharp mask',
      'For Thresholding: apply cv2.threshold() with chosen T value',
      'Compare original and enhanced histograms',
    ],
    parameters: 'Histogram equalization: no parameters (automatic). Smoothing: kernel size (odd). Sharpening: strength factor. Thresholding: threshold value T (0–255).',
    result: 'Histogram equalization produces better contrast with spread-out histogram. Smoothing reduces noise but blurs edges. Sharpening enhances edges. Thresholding produces binary image.',
    conclusion: 'Spatial domain enhancement is fundamental for preprocessing. Histogram equalization is particularly effective for low-contrast images, while thresholding enables basic segmentation.',
    vivaQuestions: [
      { question: 'What is the difference between histogram equalization and contrast stretching?', answer: 'Histogram equalization maps intensities to achieve a uniform distribution using CDF, while contrast stretching linearly maps the min-max range to [0, 255]. Equalization is more aggressive.' },
      { question: 'When would you use adaptive histogram equalization (CLAHE)?', answer: 'When the image has varying illumination across regions. CLAHE divides the image into tiles and equalizes each independently, preventing over-amplification in already bright/dark areas.' },
    ],
    pythonCode: `import cv2
import numpy as np
import matplotlib.pyplot as plt

img = cv2.imread('input.jpg', cv2.IMREAD_GRAYSCALE)

# Histogram Equalization
equalized = cv2.equalizeHist(img)

# Display histograms
fig, axes = plt.subplots(2, 2, figsize=(10, 8))
axes[0,0].imshow(img, cmap='gray')
axes[0,0].set_title('Original')
axes[0,1].hist(img.ravel(), 256, [0, 256])
axes[0,1].set_title('Original Histogram')
axes[1,0].imshow(equalized, cmap='gray')
axes[1,0].set_title('Equalized')
axes[1,1].hist(equalized.ravel(), 256, [0, 256])
axes[1,1].set_title('Equalized Histogram')

# Smoothing
smoothed = cv2.GaussianBlur(img, (5, 5), 0)

# Sharpening (unsharp mask)
blurred = cv2.GaussianBlur(img, (5, 5), 0)
sharpened = cv2.addWeighted(img, 1.5, blurred, -0.5, 0)

# Thresholding
_, binary = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY)`,
    icon: 'tune',
  },
  {
    id: 'practical-4',
    number: 4,
    type: 'practical',
    title: 'Spatial Domain Filters',
    shortTitle: 'Spatial Domain Filters',
    description: 'Linear averaging, 2D Gaussian kernels, non-linear median noise removal.',
    objective: 'To implement and compare spatial domain filters: Averaging, Gaussian, Median, and Bilateral for noise reduction and edge preservation.',
    operations: [
      { id: 'averaging', name: 'Averaging Filter', description: 'Uniform mean filter' },
      { id: 'gaussian', name: 'Gaussian Filter', description: 'Weighted Gaussian smoothing' },
      { id: 'median', name: 'Median Filter', description: 'Non-linear order-statistic filter' },
      { id: 'bilateral', name: 'Bilateral Filter', description: 'Edge-preserving smoothing' },
    ],
    operationChips: ['Gaussian', 'Median Filter', 'Bilateral'],
    tags: ['#SIMD Opt', 'Featured'],
    aim: 'To implement and analyze linear and non-linear spatial domain filtering techniques for noise reduction in digital images.',
    theory: 'Spatial domain filtering performs neighborhood operations on each pixel. The Averaging (Box) filter replaces each pixel with the mean of its neighborhood — simple but blurs edges. The Gaussian filter uses a weighted kernel based on the Gaussian function G(x,y) = (1/2πσ²)exp(-(x²+y²)/2σ²), giving more weight to central pixels. The Median filter replaces each pixel with the median of the neighborhood — excellent for salt-and-pepper noise without blurring edges. The Bilateral filter combines spatial proximity with intensity similarity, preserving edges while smoothing.',
    algorithm: [
      'Load the input image (optionally add noise for testing)',
      'Define kernel size k (must be positive odd integer)',
      'For Averaging: apply cv2.blur(img, (k, k))',
      'For Gaussian: apply cv2.GaussianBlur(img, (k, k), sigma)',
      'For Median: apply cv2.medianBlur(img, k)',
      'For Bilateral: apply cv2.bilateralFilter(img, d, sigmaColor, sigmaSpace)',
      'Compare results side-by-side',
    ],
    parameters: 'Kernel Size: must be positive odd integer (3, 5, 7, ...). Gaussian σ (sigma): standard deviation — larger values = more blur. Bilateral d: diameter of pixel neighborhood. sigmaColor/sigmaSpace: filter sigma in color/coordinate space.',
    result: 'Averaging produces uniform blur. Gaussian produces weighted blur. Median removes salt-and-pepper noise effectively. Bilateral preserves edges while smoothing flat regions.',
    conclusion: 'Different filters suit different noise types. Gaussian is general-purpose, Median excels at impulse noise, and Bilateral is best when edge preservation is critical.',
    vivaQuestions: [
      { question: 'Why must the kernel dimensions always be odd integers?', answer: 'An odd dimension provides a singular, unambiguous center origin pixel (e.g., 3×3 has center at (1,1)). An even matrix has no center, which degrades spatial integrity.' },
      { question: 'What fundamentally differentiates Gaussian from Bilateral filtering?', answer: 'Gaussian is linear and space-invariant — it weights solely by spatial distance. Bilateral is non-linear — it weights by the product of spatial and radiometric (intensity) difference, preserving edges.' },
      { question: 'What computational technique makes 2D Gaussian convolution efficient?', answer: 'Separability. The 2D kernel decomposes into the outer product of two 1D kernels: G(x,y) = G(x)·G(y). This reduces computation from O(k²) to O(2k).' },
      { question: 'Why does a Median filter outperform Averaging for salt-and-pepper noise?', answer: 'A median filter finds the center-ordered value, discarding outliers (0 or 255). Averaging includes extreme values in the sum, smearing the result.' },
    ],
    pythonCode: `# Practical 4: Spatial Domain Gaussian Smoothing & PSNR Telemetry
import cv2
import numpy as np
import matplotlib.pyplot as plt

# 1. Load noisy image in 8-bit grayscale
img_noisy = cv2.imread('specimen_sample.png', cv2.IMREAD_GRAYSCALE)

# 2. Define convolution hyperparameters
ksize = (7, 7)       # Spatial window, must be positive odd integers
sigma_x = 2.40       # Gaussian kernel standard deviation in X
border_type = cv2.BORDER_REFLECT_101

# 3. Execute spatial Gaussian convolution
img_filtered = cv2.GaussianBlur(
    img_noisy,
    ksize=ksize,
    sigmaX=sigma_x,
    sigmaY=0,          # when 0, sigmaY automatically inherits sigmaX
    borderType=border_type
)

# 4. Calculate Peak Signal-to-Noise Ratio (PSNR)
mse = np.mean((img_noisy.astype(np.float64) - img_filtered.astype(np.float64)) ** 2)
psnr_val = cv2.PSNR(img_noisy, img_filtered)
print(f"Telemetry: [psnr_val: {psnr_val:.2f} dB | Residual MSE: {mse:.4f}]")

# 5. Dual visual display with Matplotlib
fig, ax = plt.subplots(1, 2, figsize=(12, 6))
ax[0].imshow(img_noisy, cmap='gray')
ax[0].set_title('Input (Additive Gaussian Noise)')
ax[1].imshow(img_filtered, cmap='gray')
ax[1].set_title(f'Gaussian Filtered (ksize={ksize}, σ={sigma_x})')`,
    icon: 'blur_on',
  },
  {
    id: 'practical-5',
    number: 5,
    type: 'practical',
    title: 'Image Inpainting & Restoration',
    shortTitle: 'Image Inpainting',
    description: 'Interactive freehand canvas masking coupled with Telea/Fast Marching PDE solvers.',
    objective: 'To restore damaged or marked regions in images using inpainting algorithms (Telea and Navier-Stokes methods).',
    operations: [
      { id: 'telea', name: 'Telea Inpainting', description: 'Fast marching method based inpainting' },
      { id: 'navier-stokes', name: 'Navier-Stokes Inpainting', description: 'Fluid dynamics based restoration' },
    ],
    operationChips: ['Telea FMM', 'Navier-Stokes', 'Mask Brush'],
    tags: ['#PDE Solvers'],
    aim: 'To implement image inpainting using the Telea (FMM) and Navier-Stokes methods for restoring damaged regions of images.',
    theory: 'Image inpainting reconstructs missing or damaged regions using information from surrounding pixels. The Telea method uses Fast Marching to propagate known pixel values into unknown regions along the boundary, weighting by distance and gradient direction. The Navier-Stokes method treats pixel intensity as a fluid and uses the Navier-Stokes equations to smooth the flow of intensity into the damaged region, preserving isophote continuity.',
    algorithm: [
      'Load the damaged/marked image',
      'Create a binary mask marking the damaged region (white = inpaint)',
      'For Telea: apply cv2.inpaint(img, mask, radius, cv2.INPAINT_TELEA)',
      'For Navier-Stokes: apply cv2.inpaint(img, mask, radius, cv2.INPAINT_NS)',
      'Compare results from both methods',
    ],
    parameters: 'Inpainting radius: determines how far from the boundary to look for source pixels. Brush size: controls the width of the mask painting tool.',
    result: 'Both methods fill damaged regions. Telea produces smoother results for small damage. Navier-Stokes better preserves structure and edges for larger regions.',
    conclusion: 'Inpainting is effective for removing unwanted objects, restoring damaged photos, and text removal. Method choice depends on damage characteristics.',
    vivaQuestions: [
      { question: 'What is the key difference between Telea and Navier-Stokes inpainting?', answer: 'Telea uses Fast Marching Method (FMM) to propagate known pixels based on distance weighting. Navier-Stokes uses fluid dynamics equations to preserve isophote (same-intensity) lines through the inpainted region.' },
    ],
    pythonCode: `import cv2
import numpy as np

# Load image and mask
img = cv2.imread('damaged_image.jpg')
mask = cv2.imread('mask.png', cv2.IMREAD_GRAYSCALE)

# Inpainting radius
radius = 3

# Telea method (Fast Marching)
result_telea = cv2.inpaint(img, mask, radius, cv2.INPAINT_TELEA)

# Navier-Stokes method
result_ns = cv2.inpaint(img, mask, radius, cv2.INPAINT_NS)

cv2.imshow('Original', img)
cv2.imshow('Mask', mask)
cv2.imshow('Telea Result', result_telea)
cv2.imshow('Navier-Stokes Result', result_ns)
cv2.waitKey(0)`,
    icon: 'healing',
  },
  {
    id: 'practical-6',
    number: 6,
    type: 'practical',
    title: 'Lossless Image Compression',
    shortTitle: 'Lossless Compression',
    description: 'Entropy encoding benchmarks including Run-Length Encoding and Huffman coding.',
    objective: 'To implement lossless image compression using Run-Length Encoding (RLE) and verify pixel-identical decompression.',
    operations: [
      { id: 'compress', name: 'Compress', description: 'Apply lossless compression' },
      { id: 'decompress', name: 'Decompress', description: 'Reconstruct from compressed data' },
      { id: 'compare', name: 'Compare', description: 'Verify pixel-identical reconstruction' },
    ],
    operationChips: ['RLE Encoder', 'Huffman Tree', 'Bit-Plane 0-7'],
    tags: ['0% MSE Lossless'],
    aim: 'To implement lossless image compression and verify that the decompressed image is pixel-identical to the original.',
    theory: 'Lossless compression reduces file size without losing any information. Run-Length Encoding (RLE) replaces consecutive identical values with a (value, count) pair. Huffman coding assigns shorter codes to more frequent pixel values. The compression ratio depends on image content — images with large uniform regions compress better with RLE.',
    algorithm: [
      'Load input image and flatten to 1D array',
      'RLE Encode: scan pixels, count consecutive identical values',
      'Store as (value, run_length) pairs',
      'Calculate compression ratio = original_size / compressed_size',
      'RLE Decode: expand (value, count) pairs back to pixel array',
      'Reshape to original dimensions',
      'Verify: compare decompressed with original (MSE should be 0)',
    ],
    parameters: 'No tunable parameters for lossless compression — the algorithm is deterministic.',
    result: 'Compression ratio varies with image content. Binary/simple images achieve high ratios. Decompressed image is always pixel-identical to the original.',
    conclusion: 'Lossless compression preserves all information while reducing storage. RLE is simple but effective for images with spatial redundancy. Huffman coding provides better compression for varied content.',
    vivaQuestions: [
      { question: 'What is the difference between lossless and lossy compression?', answer: 'Lossless preserves all original data (pixel-identical reconstruction). Lossy discards some information for higher compression ratios (e.g., JPEG). Lossless is essential for medical and scientific imaging.' },
    ],
    pythonCode: `import cv2
import numpy as np

img = cv2.imread('input.png', cv2.IMREAD_GRAYSCALE)
flat = img.flatten()

# RLE Encode
def rle_encode(data):
    encoded = []
    i = 0
    while i < len(data):
        count = 1
        while i + count < len(data) and data[i + count] == data[i] and count < 255:
            count += 1
        encoded.append((data[i], count))
        i += count
    return encoded

# RLE Decode
def rle_decode(encoded, shape):
    decoded = []
    for value, count in encoded:
        decoded.extend([value] * count)
    return np.array(decoded, dtype=np.uint8).reshape(shape)

encoded = rle_encode(flat)
compressed_size = len(encoded) * 2  # 2 bytes per pair
original_size = len(flat)
ratio = original_size / compressed_size

print(f"Original: {original_size} bytes")
print(f"Compressed: {compressed_size} bytes")
print(f"Ratio: {ratio:.2f}:1")

decoded = rle_decode(encoded, img.shape)
print(f"Pixel-identical: {np.array_equal(img, decoded)}")`,
    icon: 'compress',
  },
  {
    id: 'practical-7',
    number: 7,
    type: 'practical',
    title: 'Morphological Image Processing',
    shortTitle: 'Morphological Operations',
    description: 'Minkowski set theory operations: erosion, dilation, compound opening/closing.',
    objective: 'To apply morphological operations (erosion, dilation, opening, closing) using different structuring elements.',
    operations: [
      { id: 'erosion', name: 'Erosion', description: 'Shrink foreground regions' },
      { id: 'dilation', name: 'Dilation', description: 'Expand foreground regions' },
      { id: 'opening', name: 'Opening', description: 'Erosion followed by dilation' },
      { id: 'closing', name: 'Closing', description: 'Dilation followed by erosion' },
    ],
    operationChips: ['Erosion', 'Dilation', 'Structuring Elem'],
    tags: ['#Binary & Gray'],
    aim: 'To implement morphological image processing operations using various structuring elements and analyze their effects on binary images.',
    theory: 'Morphological operations probe an image with a structuring element (SE). Erosion fits the SE at each position — the output pixel is 1 only if all SE pixels match foreground. This shrinks objects and removes small noise. Dilation sets the output to 1 if any SE pixel overlaps foreground — this expands objects and fills small holes. Opening (erosion then dilation) removes small objects while preserving shape. Closing (dilation then erosion) fills small holes while preserving shape.',
    algorithm: [
      'Load image and convert to binary (threshold if needed)',
      'Create structuring element: cv2.getStructuringElement(shape, size)',
      'For Erosion: cv2.erode(img, kernel, iterations)',
      'For Dilation: cv2.dilate(img, kernel, iterations)',
      'For Opening: cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel)',
      'For Closing: cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel)',
    ],
    parameters: 'Structuring element shape: Rectangle, Ellipse, or Cross. Kernel size: odd integer (3×3, 5×5, etc.). Iterations: number of times to apply the operation.',
    result: 'Erosion thins objects. Dilation fattens objects. Opening removes small bright spots (noise). Closing fills small dark holes.',
    conclusion: 'Morphological operations are powerful tools for binary image analysis, noise removal, and shape extraction. The choice of structuring element shape and size critically affects results.',
    vivaQuestions: [
      { question: 'What is the relationship between opening and closing?', answer: 'Opening = erosion followed by dilation (removes small foreground objects). Closing = dilation followed by erosion (fills small background holes). They are duals of each other.' },
      { question: 'Why is the structuring element shape important?', answer: 'The SE shape determines which patterns are preserved or removed. A circular SE treats all directions equally, while a linear SE is directional — useful for removing line-oriented noise.' },
    ],
    pythonCode: `import cv2
import numpy as np

img = cv2.imread('input.png', cv2.IMREAD_GRAYSCALE)
_, binary = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY)

# Create structuring element
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
# Options: cv2.MORPH_RECT, cv2.MORPH_ELLIPSE, cv2.MORPH_CROSS

# Morphological operations
eroded = cv2.erode(binary, kernel, iterations=1)
dilated = cv2.dilate(binary, kernel, iterations=1)
opened = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
closed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)

cv2.imshow('Original', binary)
cv2.imshow('Eroded', eroded)
cv2.imshow('Dilated', dilated)
cv2.imshow('Opened', opened)
cv2.imshow('Closed', closed)
cv2.waitKey(0)`,
    icon: 'filter_alt',
  },
  {
    id: 'practical-8',
    number: 8,
    type: 'practical',
    title: 'Object Detection via Correlation',
    shortTitle: 'Object Detection Correlation',
    description: 'Normalized Cross-Correlation (TM_CCOEFF_NORMED) template matching and peak detection.',
    objective: 'To detect objects in images using template matching via normalized cross-correlation.',
    operations: [
      { id: 'template-match', name: 'Template Match', description: 'Find template in source image' },
    ],
    operationChips: ['Norm Cross-Corr', 'Template Match', 'Peak Detector'],
    tags: ['#NCC Matched'],
    aim: 'To implement object detection using normalized cross-correlation based template matching.',
    theory: 'Template matching slides a template image over the source image and computes a similarity metric at each position. Normalized Cross-Correlation (NCC) is robust to brightness changes: NCC(x,y) = Σ(T·I) / sqrt(Σ(T²)·Σ(I²)), where T is the template patch and I is the image patch. The peak in the correlation map indicates the best match location.',
    algorithm: [
      'Load source image and template image',
      'Apply cv2.matchTemplate(source, template, method)',
      'Method: cv2.TM_CCOEFF_NORMED for normalized correlation',
      'Find peak location: cv2.minMaxLoc(result)',
      'Draw bounding box at detected location',
      'Display match score and result',
    ],
    parameters: 'Template image: the object to find. Matching method: TM_CCOEFF_NORMED (recommended), TM_CCORR_NORMED, etc.',
    result: 'Bounding box drawn at the location of highest correlation. Match score indicates confidence (1.0 = perfect match).',
    conclusion: 'Template matching is effective for finding known objects in fixed orientation/scale. For rotation/scale-invariant detection, feature-based methods (SIFT, ORB) are preferred.',
    vivaQuestions: [
      { question: 'What are the limitations of template matching?', answer: 'Template matching is sensitive to scale, rotation, and illumination changes. It only finds exact or near-exact matches of the template pattern.' },
      { question: 'Why is normalized cross-correlation preferred over raw correlation?', answer: 'Normalization removes the effect of brightness and contrast differences, making the match score invariant to linear intensity changes.' },
    ],
    pythonCode: `import cv2
import numpy as np

# Load source and template
source = cv2.imread('source.jpg')
template = cv2.imread('template.jpg')
h, w = template.shape[:2]

# Template matching
result = cv2.matchTemplate(source, template, cv2.TM_CCOEFF_NORMED)
min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

# Draw bounding box
top_left = max_loc
bottom_right = (top_left[0] + w, top_left[1] + h)
output = source.copy()
cv2.rectangle(output, top_left, bottom_right, (0, 0, 255), 2)

print(f"Match Score: {max_val:.4f}")
print(f"Location: {top_left}")

cv2.imshow('Detection Result', output)
cv2.waitKey(0)`,
    icon: 'center_focus_strong',
  },
];

export const postlabs: ExperimentData[] = [
  {
    id: 'postlab-1',
    number: 1,
    type: 'postlab',
    title: 'Top-Hat Transformation',
    shortTitle: 'Top-Hat Transformation',
    description: 'Correction of non-uniform illumination and vignetting artifacts using White and Black Top-Hat.',
    objective: 'To apply top-hat transformation for extracting small bright/dark features and correcting uneven illumination.',
    operations: [
      { id: 'white-tophat', name: 'White Top-Hat', description: 'Extract bright features smaller than SE' },
      { id: 'black-tophat', name: 'Black Top-Hat', description: 'Extract dark features smaller than SE' },
    ],
    operationChips: ['White Top-Hat', 'Black Top-Hat', 'Background Flat'],
    tags: ['Illumination Ops'],
    aim: 'To implement top-hat transformations for uneven illumination correction and small feature enhancement.',
    theory: 'White Top-Hat = Original − Opening. It extracts bright features smaller than the structuring element — objects brighter than their surroundings. Black Top-Hat = Closing − Original. It extracts dark features smaller than the SE. Top-hat is particularly useful for correcting uneven illumination: by subtracting the background estimate (opening) from the original.',
    algorithm: [
      'Load grayscale image',
      'Create structuring element: cv2.getStructuringElement(shape, (size, size))',
      'White Top-Hat: cv2.morphologyEx(img, cv2.MORPH_TOPHAT, kernel)',
      'Black Top-Hat: cv2.morphologyEx(img, cv2.MORPH_BLACKHAT, kernel)',
      'For illumination correction: enhanced = img + white_tophat',
    ],
    parameters: 'Structuring element shape (Rect, Ellipse, Cross) and size. Larger SE captures larger background variations.',
    result: 'White top-hat reveals small bright features against dark background. Black top-hat reveals small dark features. Enhanced image has more uniform illumination.',
    conclusion: 'Top-hat transformation is effective for preprocessing images with non-uniform illumination, common in microscopy and medical imaging.',
    vivaQuestions: [
      { question: 'When would you use top-hat transformation?', answer: 'When you need to detect small features in images with non-uniform illumination (e.g., microscopy, document scanning, defect detection on textured surfaces).' },
    ],
    pythonCode: `import cv2
import numpy as np

img = cv2.imread('input.png', cv2.IMREAD_GRAYSCALE)

# Structuring element
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19))

# White Top-Hat (WTH = I - Opening(I))
wth = cv2.morphologyEx(img, cv2.MORPH_TOPHAT, kernel)

# Black Top-Hat (BTH = Closing(I) - I)
bth = cv2.morphologyEx(img, cv2.MORPH_BLACKHAT, kernel)

# Illumination correction
enhanced = cv2.add(img, wth)

cv2.imshow('Original', img)
cv2.imshow('White Top-Hat', wth)
cv2.imshow('Black Top-Hat', bth)
cv2.imshow('Enhanced', enhanced)
cv2.waitKey(0)`,
    icon: 'wb_sunny',
  },
  {
    id: 'postlab-2',
    number: 2,
    type: 'postlab',
    title: 'Colour Space Conversion',
    shortTitle: 'Colour Space Conversion',
    description: 'Non-linear multidimensional transformations separating chrominance from luminance.',
    objective: 'To convert images between RGB, HSV, YCrCb, and Lab color spaces and analyze individual channels.',
    operations: [
      { id: 'rgb-hsv', name: 'RGB → HSV', description: 'Hue-Saturation-Value conversion' },
      { id: 'rgb-ycrcb', name: 'RGB → YCrCb', description: 'Luminance-chrominance conversion' },
      { id: 'rgb-lab', name: 'RGB → Lab', description: 'Perceptually uniform color space' },
      { id: 'channel-split', name: 'Channel Split', description: 'View individual channels' },
    ],
    operationChips: ['RGB ↔ HSV', 'CIELab L*a*b*', 'YCrCb Split'],
    tags: ['Spectral Spaces'],
    aim: 'To implement color space conversions and analyze the properties of different color representations.',
    theory: 'Different color spaces represent color information differently. RGB stores red/green/blue intensities. HSV separates Hue (color type, 0-180°), Saturation (color purity), and Value (brightness). YCrCb separates luminance (Y) from chrominance (Cr, Cb) — used in video compression. Lab (CIE L*a*b*) is perceptually uniform — equal numerical changes correspond to equal perceived color differences. L* = lightness, a* = green-red axis, b* = blue-yellow axis.',
    algorithm: [
      'Load the RGB image',
      'Convert: hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)',
      'Convert: ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)',
      'Convert: lab = cv2.cvtColor(img, cv2.COLOR_BGR2Lab)',
      'Split channels: cv2.split(converted)',
      'Display each channel as grayscale and annotate',
    ],
    parameters: 'Source color space, target color space. No additional tunable parameters.',
    result: 'HSV: H channel shows hue distribution, S shows saturation, V shows brightness. YCrCb: Y contains most structural info. Lab: L* correlates with perceived brightness.',
    conclusion: 'Color space selection impacts algorithm performance. HSV is useful for color-based segmentation, YCrCb for compression, and Lab for perceptually-based operations.',
    vivaQuestions: [
      { question: 'Why is HSV useful for color-based segmentation?', answer: 'HSV separates color information (Hue) from illumination (Value), making it easier to define color ranges that are robust to lighting changes.' },
    ],
    pythonCode: `import cv2
import numpy as np
import matplotlib.pyplot as plt

img = cv2.imread('input.jpg')

# Color space conversions
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
lab = cv2.cvtColor(img, cv2.COLOR_BGR2Lab)
ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)

# Chrominance plane isolation
h, s, v = cv2.split(hsv)
l, a, b = cv2.split(lab)
y, cr, cb = cv2.split(ycrcb)

# Display
fig, axes = plt.subplots(3, 4, figsize=(16, 12))
titles = [
    ['Original', 'H (Hue)', 'S (Saturation)', 'V (Value)'],
    ['Lab', 'L (Lightness)', 'a (Green-Red)', 'b (Blue-Yellow)'],
    ['YCrCb', 'Y (Luma)', 'Cr (Red Chroma)', 'Cb (Blue Chroma)']
]
images = [
    [cv2.cvtColor(img, cv2.COLOR_BGR2RGB), h, s, v],
    [cv2.cvtColor(img, cv2.COLOR_BGR2RGB), l, a, b],
    [cv2.cvtColor(img, cv2.COLOR_BGR2RGB), y, cr, cb]
]
for i in range(3):
    for j in range(4):
        cmap = None if j == 0 else 'gray'
        axes[i,j].imshow(images[i][j], cmap=cmap)
        axes[i,j].set_title(titles[i][j])
plt.tight_layout()
plt.show()`,
    icon: 'palette',
  },
  {
    id: 'postlab-3',
    number: 3,
    type: 'postlab',
    title: 'Multi-Method Edge Detection',
    shortTitle: 'Edge Detection',
    description: 'Real-time tri-view comparative synthesis of Canny, Sobel, and Prewitt edge operators.',
    objective: 'To implement and compare Canny, Sobel, and Prewitt edge detection methods.',
    operations: [
      { id: 'canny', name: 'Canny', description: 'Multi-stage edge detector with hysteresis' },
      { id: 'sobel', name: 'Sobel', description: 'Gradient-based edge detection' },
      { id: 'prewitt', name: 'Prewitt', description: 'Simple gradient operator' },
    ],
    operationChips: ['Canny Hysteresis', 'Sobel X/Y', 'Prewitt 3x3'],
    tags: ['Gradient Maps'],
    aim: 'To implement and compare three edge detection techniques: Canny (double-threshold hysteresis), Sobel (gradient magnitude), and Prewitt (simple gradient).',
    theory: 'Edge detection identifies boundaries where pixel intensity changes rapidly. Sobel uses two 3×3 kernels (Gx, Gy) to compute horizontal and vertical gradients — magnitude = sqrt(Gx²+Gy²). Prewitt is similar but uses uniform weights instead of emphasizing the center. Canny is a multi-stage algorithm: (1) Gaussian smoothing, (2) gradient computation, (3) non-maximum suppression, (4) double-threshold hysteresis linking. Canny produces thin, connected edges and is considered the gold standard.',
    algorithm: [
      'Load image and convert to grayscale',
      'Canny: edges = cv2.Canny(gray, low_threshold, high_threshold)',
      'Sobel X: sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize)',
      'Sobel Y: sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize)',
      'Sobel magnitude: sobel = np.sqrt(sobelx² + sobely²)',
      'Prewitt: convolve with Prewitt kernels using cv2.filter2D()',
      'Compare all three results side-by-side',
    ],
    parameters: 'Canny: lower threshold, upper threshold (recommended ratio 1:2 or 1:3). Sobel: kernel size (1,3,5,7), direction (X,Y). Prewitt: direction (X,Y).',
    result: 'Canny produces clean, thin, connected edges. Sobel shows gradient magnitude with some thickness. Prewitt gives similar results to Sobel but slightly less noise-resistant.',
    conclusion: 'Canny is the most sophisticated and generally produces the best edge maps. Sobel is simpler and good for gradient estimation. Prewitt is the simplest but adequate for clean images.',
    vivaQuestions: [
      { question: 'Why does Canny use double thresholding?', answer: 'Low threshold catches weak edges, high threshold identifies strong edges. Hysteresis connects weak edges to strong edges — weak edges are kept only if connected to a strong edge. This reduces noise while preserving edge continuity.' },
      { question: 'What is non-maximum suppression in Canny?', answer: 'NMS thins edges by keeping only the pixel with maximum gradient magnitude along the gradient direction. This converts thick gradient regions into thin, 1-pixel-wide edges.' },
    ],
    pythonCode: `import cv2
import numpy as np
import matplotlib.pyplot as plt

img = cv2.imread('input.jpg', cv2.IMREAD_GRAYSCALE)

# Canny Edge Detection
canny = cv2.Canny(img, 50, 150)

# Sobel Edge Detection
sobelx = cv2.Sobel(img, cv2.CV_64F, 1, 0, ksize=3)
sobely = cv2.Sobel(img, cv2.CV_64F, 0, 1, ksize=3)
sobel = np.sqrt(sobelx**2 + sobely**2)
sobel = np.uint8(np.clip(sobel, 0, 255))

# Prewitt Edge Detection
kernelx = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]])
kernely = np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]])
prewittx = cv2.filter2D(img, cv2.CV_64F, kernelx)
prewitty = cv2.filter2D(img, cv2.CV_64F, kernely)
prewitt = np.sqrt(prewittx**2 + prewitty**2)
prewitt = np.uint8(np.clip(prewitt, 0, 255))

# Display comparison
fig, axes = plt.subplots(1, 4, figsize=(20, 5))
axes[0].imshow(img, cmap='gray'); axes[0].set_title('Original')
axes[1].imshow(canny, cmap='gray'); axes[1].set_title('Canny')
axes[2].imshow(sobel, cmap='gray'); axes[2].set_title('Sobel')
axes[3].imshow(prewitt, cmap='gray'); axes[3].set_title('Prewitt')
plt.tight_layout()
plt.show()`,
    icon: 'border_style',
  },
];

export const allExperiments: ExperimentData[] = [...practicals, ...postlabs];

export function getExperimentById(id: string): ExperimentData | undefined {
  return allExperiments.find((e) => e.id === id);
}
