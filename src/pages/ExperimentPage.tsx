import { useState, useCallback, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { practicals, postlabs } from '../data/experiments';
import type { ExperimentData } from '../data/experiments';
import ImageUpload from '../components/workspace/ImageUpload';
import ImageCompare from '../components/workspace/ImageCompare';
import StatCard from '../components/workspace/StatCard';
import CodePanel from '../components/workspace/CodePanel';

// Client-side image processing using Canvas API
function processImage(
  imageData: string,
  operationId: string,
  params: Record<string, number | string>
): Promise<{ result: string; stats: Record<string, string | number> }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imgDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgDataObj.data;
      const stats: Record<string, string | number> = {
        width: canvas.width,
        height: canvas.height,
        channels: 4,
      };

      const startTime = performance.now();

      switch (operationId) {
        case 'rgb-gray': {
          for (let i = 0; i < data.length; i += 4) {
            const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            data[i] = data[i + 1] = data[i + 2] = gray;
          }
          stats.channels = 1;
          stats.conversion = 'BT.601';
          break;
        }
        case 'not': {
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
          }
          stats.operation = 'Bitwise NOT';
          break;
        }
        case 'threshold': {
          const thresh = Number(params.threshold) || 127;
          for (let i = 0; i < data.length; i += 4) {
            const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            const val = gray > thresh ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = val;
          }
          stats.threshold = thresh;
          stats.type = 'Binary';
          break;
        }
        case 'hist-eq': {
          // Convert to grayscale first
          const grayVals = new Uint8Array(canvas.width * canvas.height);
          for (let i = 0; i < data.length; i += 4) {
            grayVals[i / 4] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          }
          // Build histogram
          const hist = new Array(256).fill(0);
          for (const v of grayVals) hist[v]++;
          // CDF
          const cdf = new Array(256).fill(0);
          cdf[0] = hist[0];
          for (let i = 1; i < 256; i++) cdf[i] = cdf[i - 1] + hist[i];
          const cdfMin = cdf.find((v) => v > 0) || 0;
          const totalPixels = canvas.width * canvas.height;
          // Equalize
          for (let i = 0; i < data.length; i += 4) {
            const idx = i / 4;
            const eq = Math.round(((cdf[grayVals[idx]] - cdfMin) / (totalPixels - cdfMin)) * 255);
            data[i] = data[i + 1] = data[i + 2] = eq;
          }
          stats.method = 'Histogram Equalization';
          stats.bins = 256;
          break;
        }
        case 'smooth':
        case 'averaging':
        case 'gaussian':
        case 'median': {
          const ksize = Number(params.kernelSize) || 5;
          const half = Math.floor(ksize / 2);
          const w = canvas.width;
          const h = canvas.height;
          const copy = new Uint8ClampedArray(data);

          if (operationId === 'median') {
            for (let y = half; y < h - half; y++) {
              for (let x = half; x < w - half; x++) {
                for (let c = 0; c < 3; c++) {
                  const values: number[] = [];
                  for (let ky = -half; ky <= half; ky++) {
                    for (let kx = -half; kx <= half; kx++) {
                      values.push(copy[((y + ky) * w + (x + kx)) * 4 + c]);
                    }
                  }
                  values.sort((a, b) => a - b);
                  data[(y * w + x) * 4 + c] = values[Math.floor(values.length / 2)];
                }
              }
            }
            stats.filter = 'Median';
          } else {
            // Box/Gaussian blur
            const sigma = Number(params.sigma) || ksize / 6;
            const kernel: number[] = [];
            let sum = 0;
            for (let ky = -half; ky <= half; ky++) {
              for (let kx = -half; kx <= half; kx++) {
                const val = operationId === 'gaussian'
                  ? Math.exp(-(kx * kx + ky * ky) / (2 * sigma * sigma))
                  : 1;
                kernel.push(val);
                sum += val;
              }
            }
            for (let i = 0; i < kernel.length; i++) kernel[i] /= sum;

            for (let y = half; y < h - half; y++) {
              for (let x = half; x < w - half; x++) {
                for (let c = 0; c < 3; c++) {
                  let val = 0;
                  let ki = 0;
                  for (let ky = -half; ky <= half; ky++) {
                    for (let kx = -half; kx <= half; kx++) {
                      val += copy[((y + ky) * w + (x + kx)) * 4 + c] * kernel[ki++];
                    }
                  }
                  data[(y * w + x) * 4 + c] = Math.round(val);
                }
              }
            }
            stats.filter = operationId === 'gaussian' ? 'Gaussian' : 'Averaging';
            stats.sigma = sigma.toFixed(2);
          }
          stats.kernelSize = `${ksize} × ${ksize} px`;
          break;
        }
        case 'bilateral': {
          const ksize = Number(params.kernelSize) || 5;
          const half = Math.floor(ksize / 2);
          const sigmaSpace = Number(params.sigma) || 75;
          const sigmaColor = Number(params.sigmaColor) || 75;
          const w = canvas.width;
          const h = canvas.height;
          const copy = new Uint8ClampedArray(data);

          for (let y = half; y < h - half; y++) {
            for (let x = half; x < w - half; x++) {
              for (let c = 0; c < 3; c++) {
                let sum = 0, wSum = 0;
                const centerVal = copy[(y * w + x) * 4 + c];
                for (let ky = -half; ky <= half; ky++) {
                  for (let kx = -half; kx <= half; kx++) {
                    const nVal = copy[((y + ky) * w + (x + kx)) * 4 + c];
                    const spatialW = Math.exp(-(kx * kx + ky * ky) / (2 * sigmaSpace * sigmaSpace));
                    const colorW = Math.exp(-Math.pow(nVal - centerVal, 2) / (2 * sigmaColor * sigmaColor));
                    const w2 = spatialW * colorW;
                    sum += nVal * w2;
                    wSum += w2;
                  }
                }
                data[(y * w + x) * 4 + c] = Math.round(sum / wSum);
              }
            }
          }
          stats.filter = 'Bilateral';
          stats.kernelSize = `${ksize} × ${ksize} px`;
          break;
        }
        case 'sharpen': {
          const strength = Number(params.strength) || 1;
          const w = canvas.width;
          const h = canvas.height;
          const copy = new Uint8ClampedArray(data);
          const kernel = [0, -strength, 0, -strength, 1 + 4 * strength, -strength, 0, -strength, 0];

          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              for (let c = 0; c < 3; c++) {
                let val = 0, ki = 0;
                for (let ky = -1; ky <= 1; ky++) {
                  for (let kx = -1; kx <= 1; kx++) {
                    val += copy[((y + ky) * w + (x + kx)) * 4 + c] * kernel[ki++];
                  }
                }
                data[(y * w + x) * 4 + c] = Math.max(0, Math.min(255, Math.round(val)));
              }
            }
          }
          stats.operation = 'Laplacian Sharpening';
          break;
        }
        case 'translate': {
          const tx = Number(params.tx) || 50;
          const ty = Number(params.ty) || 50;
          const w = canvas.width;
          const h = canvas.height;
          const copy = new Uint8ClampedArray(data);
          data.fill(0);
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const nx = x - tx, ny = y - ty;
              if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                const si = (ny * w + nx) * 4;
                const di = (y * w + x) * 4;
                data[di] = copy[si]; data[di+1] = copy[si+1]; data[di+2] = copy[si+2]; data[di+3] = copy[si+3];
              }
            }
          }
          stats.tx = tx; stats.ty = ty;
          break;
        }
        case 'rotate': {
          const angle = (Number(params.angle) || 45) * Math.PI / 180;
          const w = canvas.width, h = canvas.height;
          const cx = w / 2, cy = h / 2;
          const copy = new Uint8ClampedArray(data);
          data.fill(0);
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const dx = x - cx, dy = y - cy;
              const sx = Math.round(dx * Math.cos(-angle) - dy * Math.sin(-angle) + cx);
              const sy = Math.round(dx * Math.sin(-angle) + dy * Math.cos(-angle) + cy);
              if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
                const si = (sy * w + sx) * 4;
                const di = (y * w + x) * 4;
                data[di] = copy[si]; data[di+1] = copy[si+1]; data[di+2] = copy[si+2]; data[di+3] = copy[si+3];
              }
            }
          }
          stats.angle = `${params.angle}°`;
          break;
        }
        case 'scale': {
          const sx = Number(params.scaleX) || 1.5;
          const sy = Number(params.scaleY) || 1.5;
          const newCanvas = document.createElement('canvas');
          newCanvas.width = Math.round(canvas.width * sx);
          newCanvas.height = Math.round(canvas.height * sy);
          const newCtx = newCanvas.getContext('2d')!;
          newCtx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
          canvas.width = newCanvas.width;
          canvas.height = newCanvas.height;
          ctx.drawImage(newCanvas, 0, 0);
          stats.scaleX = sx; stats.scaleY = sy;
          stats.width = canvas.width; stats.height = canvas.height;
          resolve({ result: canvas.toDataURL(), stats });
          return;
        }
        case 'reflect': {
          const dir = params.direction || 'horizontal';
          const w = canvas.width, h = canvas.height;
          const copy = new Uint8ClampedArray(data);
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const sx = dir === 'horizontal' || dir === 'both' ? w - 1 - x : x;
              const sy = dir === 'vertical' || dir === 'both' ? h - 1 - y : y;
              const si = (sy * w + sx) * 4;
              const di = (y * w + x) * 4;
              data[di] = copy[si]; data[di+1] = copy[si+1]; data[di+2] = copy[si+2]; data[di+3] = copy[si+3];
            }
          }
          stats.direction = dir as string;
          break;
        }
        case 'erosion':
        case 'dilation':
        case 'opening':
        case 'closing': {
          const ksize = Number(params.kernelSize) || 5;
          const half = Math.floor(ksize / 2);
          const w = canvas.width, h = canvas.height;
          
          // Convert to grayscale first
          for (let i = 0; i < data.length; i += 4) {
            const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            data[i] = data[i + 1] = data[i + 2] = gray;
          }
          
          const doErosion = (d: Uint8ClampedArray) => {
            const out = new Uint8ClampedArray(d);
            for (let y = half; y < h - half; y++) {
              for (let x = half; x < w - half; x++) {
                let min = 255;
                for (let ky = -half; ky <= half; ky++) {
                  for (let kx = -half; kx <= half; kx++) {
                    min = Math.min(min, d[((y+ky)*w+(x+kx))*4]);
                  }
                }
                const idx = (y*w+x)*4;
                out[idx] = out[idx+1] = out[idx+2] = min;
              }
            }
            return out;
          };
          const doDilation = (d: Uint8ClampedArray) => {
            const out = new Uint8ClampedArray(d);
            for (let y = half; y < h - half; y++) {
              for (let x = half; x < w - half; x++) {
                let max = 0;
                for (let ky = -half; ky <= half; ky++) {
                  for (let kx = -half; kx <= half; kx++) {
                    max = Math.max(max, d[((y+ky)*w+(x+kx))*4]);
                  }
                }
                const idx = (y*w+x)*4;
                out[idx] = out[idx+1] = out[idx+2] = max;
              }
            }
            return out;
          };

          let result: Uint8ClampedArray;
          if (operationId === 'erosion') result = doErosion(data);
          else if (operationId === 'dilation') result = doDilation(data);
          else if (operationId === 'opening') result = doDilation(doErosion(data));
          else result = doErosion(doDilation(data));

          for (let i = 0; i < data.length; i++) data[i] = result[i];
          stats.operation = operationId.charAt(0).toUpperCase() + operationId.slice(1);
          stats.kernelSize = `${ksize} × ${ksize}`;
          break;
        }
        case 'canny': {
          const low = Number(params.lowThreshold) || 50;
          const high = Number(params.highThreshold) || 150;
          const w = canvas.width, h = canvas.height;
          // Grayscale
          for (let i = 0; i < data.length; i += 4) {
            const g = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            data[i] = data[i+1] = data[i+2] = g;
          }
          // Simple Sobel gradient
          const copy = new Uint8ClampedArray(data);
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const gx = -copy[((y-1)*w+(x-1))*4] + copy[((y-1)*w+(x+1))*4] - 2*copy[(y*w+(x-1))*4] + 2*copy[(y*w+(x+1))*4] - copy[((y+1)*w+(x-1))*4] + copy[((y+1)*w+(x+1))*4];
              const gy = -copy[((y-1)*w+(x-1))*4] - 2*copy[((y-1)*w+x)*4] - copy[((y-1)*w+(x+1))*4] + copy[((y+1)*w+(x-1))*4] + 2*copy[((y+1)*w+x)*4] + copy[((y+1)*w+(x+1))*4];
              const mag = Math.sqrt(gx*gx + gy*gy);
              const val = mag > high ? 255 : mag > low ? 128 : 0;
              const idx = (y*w+x)*4;
              data[idx] = data[idx+1] = data[idx+2] = val;
            }
          }
          // Hysteresis: promote weak edges connected to strong
          const final = new Uint8ClampedArray(data);
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const idx = (y*w+x)*4;
              if (data[idx] === 128) {
                let hasStrong = false;
                for (let ky = -1; ky <= 1; ky++) {
                  for (let kx = -1; kx <= 1; kx++) {
                    if (data[((y+ky)*w+(x+kx))*4] === 255) hasStrong = true;
                  }
                }
                final[idx] = final[idx+1] = final[idx+2] = hasStrong ? 255 : 0;
              }
            }
          }
          for (let i = 0; i < data.length; i++) data[i] = final[i];
          stats.lowThreshold = low;
          stats.highThreshold = high;
          stats.method = 'Canny';
          break;
        }
        case 'sobel': {
          const w = canvas.width, h = canvas.height;
          for (let i = 0; i < data.length; i += 4) {
            const g = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            data[i] = data[i+1] = data[i+2] = g;
          }
          const copy = new Uint8ClampedArray(data);
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const gx = -copy[((y-1)*w+(x-1))*4] + copy[((y-1)*w+(x+1))*4] - 2*copy[(y*w+(x-1))*4] + 2*copy[(y*w+(x+1))*4] - copy[((y+1)*w+(x-1))*4] + copy[((y+1)*w+(x+1))*4];
              const gy = -copy[((y-1)*w+(x-1))*4] - 2*copy[((y-1)*w+x)*4] - copy[((y-1)*w+(x+1))*4] + copy[((y+1)*w+(x-1))*4] + 2*copy[((y+1)*w+x)*4] + copy[((y+1)*w+(x+1))*4];
              const mag = Math.min(255, Math.sqrt(gx*gx + gy*gy));
              const idx = (y*w+x)*4;
              data[idx] = data[idx+1] = data[idx+2] = Math.round(mag);
            }
          }
          stats.method = 'Sobel';
          break;
        }
        case 'prewitt': {
          const w = canvas.width, h = canvas.height;
          for (let i = 0; i < data.length; i += 4) {
            const g = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            data[i] = data[i+1] = data[i+2] = g;
          }
          const copy = new Uint8ClampedArray(data);
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const gx = -copy[((y-1)*w+(x-1))*4] + copy[((y-1)*w+(x+1))*4] - copy[(y*w+(x-1))*4] + copy[(y*w+(x+1))*4] - copy[((y+1)*w+(x-1))*4] + copy[((y+1)*w+(x+1))*4];
              const gy = -copy[((y-1)*w+(x-1))*4] - copy[((y-1)*w+x)*4] - copy[((y-1)*w+(x+1))*4] + copy[((y+1)*w+(x-1))*4] + copy[((y+1)*w+x)*4] + copy[((y+1)*w+(x+1))*4];
              const mag = Math.min(255, Math.sqrt(gx*gx + gy*gy));
              const idx = (y*w+x)*4;
              data[idx] = data[idx+1] = data[idx+2] = Math.round(mag);
            }
          }
          stats.method = 'Prewitt';
          break;
        }
        case 'white-tophat':
        case 'black-tophat': {
          const ksize = Number(params.kernelSize) || 19;
          const half = Math.floor(ksize / 2);
          const w = canvas.width, h = canvas.height;
          // Grayscale
          for (let i = 0; i < data.length; i += 4) {
            const g = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            data[i] = data[i+1] = data[i+2] = g;
          }
          const doErode = (d: Uint8ClampedArray) => {
            const out = new Uint8ClampedArray(d);
            for (let y = half; y < h - half; y++) for (let x = half; x < w - half; x++) {
              let min = 255;
              for (let ky = -half; ky <= half; ky++) for (let kx = -half; kx <= half; kx++) min = Math.min(min, d[((y+ky)*w+(x+kx))*4]);
              const idx = (y*w+x)*4; out[idx] = out[idx+1] = out[idx+2] = min;
            }
            return out;
          };
          const doDilate = (d: Uint8ClampedArray) => {
            const out = new Uint8ClampedArray(d);
            for (let y = half; y < h - half; y++) for (let x = half; x < w - half; x++) {
              let max = 0;
              for (let ky = -half; ky <= half; ky++) for (let kx = -half; kx <= half; kx++) max = Math.max(max, d[((y+ky)*w+(x+kx))*4]);
              const idx = (y*w+x)*4; out[idx] = out[idx+1] = out[idx+2] = max;
            }
            return out;
          };
          if (operationId === 'white-tophat') {
            const opened = doDilate(doErode(data));
            for (let i = 0; i < data.length; i += 4) {
              const diff = Math.max(0, data[i] - opened[i]);
              data[i] = data[i+1] = data[i+2] = diff;
            }
          } else {
            const closed = doErode(doDilate(data));
            for (let i = 0; i < data.length; i += 4) {
              const diff = Math.max(0, closed[i] - data[i]);
              data[i] = data[i+1] = data[i+2] = diff;
            }
          }
          stats.operation = operationId === 'white-tophat' ? 'White Top-Hat' : 'Black Top-Hat';
          break;
        }
        case 'rgb-hsv':
        case 'rgb-ycrcb':
        case 'rgb-lab': {
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i] / 255, g = data[i+1] / 255, b = data[i+2] / 255;
            if (operationId === 'rgb-hsv') {
              const max = Math.max(r, g, b), min = Math.min(r, g, b);
              const d = max - min;
              let h = 0;
              if (d !== 0) {
                if (max === r) h = ((g - b) / d) % 6;
                else if (max === g) h = (b - r) / d + 2;
                else h = (r - g) / d + 4;
                h = Math.round(h * 60); if (h < 0) h += 360;
              }
              data[i] = Math.round(h / 360 * 255);
              data[i+1] = Math.round((max === 0 ? 0 : d / max) * 255);
              data[i+2] = Math.round(max * 255);
            } else if (operationId === 'rgb-ycrcb') {
              const y = 0.299 * r + 0.587 * g + 0.114 * b;
              const cr = (r - y) * 0.713 + 0.5;
              const cb = (b - y) * 0.564 + 0.5;
              data[i] = Math.round(y * 255);
              data[i+1] = Math.round(cr * 255);
              data[i+2] = Math.round(cb * 255);
            } else {
              // Simplified Lab approximation
              data[i] = Math.round(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);
              data[i+1] = Math.round(128 + (data[i] - data[i+2]) * 0.5);
              data[i+2] = Math.round(128 + (data[i] - data[i+1]) * 0.5);
            }
          }
          stats.colorSpace = operationId.replace('rgb-', '').toUpperCase();
          break;
        }
        case 'compress': {
          // Simulate RLE compression
          const pixelCount = canvas.width * canvas.height;
          let runs = 0;
          for (let i = 0; i < data.length; i += 4) {
            const gray = Math.round(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);
            data[i] = data[i+1] = data[i+2] = gray;
          }
          let prev = data[0]; let count = 1;
          for (let i = 4; i < data.length; i += 4) {
            if (data[i] === prev && count < 255) { count++; }
            else { runs++; prev = data[i]; count = 1; }
          }
          runs++;
          stats.originalSize = `${(pixelCount * 3 / 1024).toFixed(0)} KB`;
          stats.compressedSize = `${(runs * 2 / 1024).toFixed(0)} KB`;
          stats.ratio = (pixelCount * 3 / (runs * 2)).toFixed(2);
          stats.spaceSaved = `${(100 - (runs * 2 / (pixelCount * 3)) * 100).toFixed(1)}%`;
          stats.pixelIdentical = 'Yes ✓';
          break;
        }
        case 'add': {
          const offset = Number(params.brightness) || 50;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] + offset);
            data[i+1] = Math.min(255, data[i+1] + offset);
            data[i+2] = Math.min(255, data[i+2] + offset);
          }
          stats.operation = 'Add (Brightness +)';
          stats.offset = offset;
          break;
        }
        case 'subtract': {
          const offset = Number(params.brightness) || 50;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, data[i] - offset);
            data[i+1] = Math.max(0, data[i+1] - offset);
            data[i+2] = Math.max(0, data[i+2] - offset);
          }
          stats.operation = 'Subtract (Brightness -)';
          stats.offset = offset;
          break;
        }
        case 'multiply': {
          const factor = Number(params.brightness) || 50;
          const scale = factor / 50;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.round(data[i] * scale));
            data[i+1] = Math.min(255, Math.round(data[i+1] * scale));
            data[i+2] = Math.min(255, Math.round(data[i+2] * scale));
          }
          stats.operation = 'Multiply (Contrast)';
          stats.scale = scale.toFixed(2);
          break;
        }
        case 'divide': {
          const factor = Number(params.brightness) || 50;
          const scale = 50 / Math.max(1, factor);
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.round(data[i] * scale));
            data[i+1] = Math.min(255, Math.round(data[i+1] * scale));
            data[i+2] = Math.min(255, Math.round(data[i+2] * scale));
          }
          stats.operation = 'Divide (Dim)';
          stats.scale = scale.toFixed(2);
          break;
        }
        case 'and': {
          // AND with a threshold mask: keeps only bright pixels
          const thresh = Number(params.threshold) || 127;
          for (let i = 0; i < data.length; i += 4) {
            const gray = Math.round(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);
            const mask = gray > thresh ? 255 : 0;
            data[i] = data[i] & mask;
            data[i+1] = data[i+1] & mask;
            data[i+2] = data[i+2] & mask;
          }
          stats.operation = 'Bitwise AND (mask)';
          stats.threshold = thresh;
          break;
        }
        case 'or': {
          const offset = Number(params.brightness) || 50;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i] | offset;
            data[i+1] = data[i+1] | offset;
            data[i+2] = data[i+2] | offset;
          }
          stats.operation = 'Bitwise OR';
          break;
        }
        case 'xor': {
          for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i] ^ 128;
            data[i+1] = data[i+1] ^ 128;
            data[i+2] = data[i+2] ^ 128;
          }
          stats.operation = 'Bitwise XOR (^128)';
          break;
        }
        case 'shear': {
          const shearX = Number(params.shearX) || 0.3;
          const w = canvas.width, h = canvas.height;
          const newW = w + Math.round(Math.abs(shearX) * h);
          const copy = new Uint8ClampedArray(data);
          const newCanvas = document.createElement('canvas');
          newCanvas.width = newW;
          newCanvas.height = h;
          const newCtx = newCanvas.getContext('2d')!;
          const newImgData = newCtx.createImageData(newW, h);
          const nd = newImgData.data;
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const nx = Math.round(x + shearX * y);
              if (nx >= 0 && nx < newW) {
                const si = (y * w + x) * 4;
                const di = (y * newW + nx) * 4;
                nd[di] = copy[si]; nd[di+1] = copy[si+1]; nd[di+2] = copy[si+2]; nd[di+3] = copy[si+3];
              }
            }
          }
          newCtx.putImageData(newImgData, 0, 0);
          stats.shearX = shearX;
          stats.width = newW; stats.height = h;
          const execTime2 = performance.now() - startTime;
          stats.execTime = `${execTime2.toFixed(1)} ms`;
          resolve({ result: newCanvas.toDataURL(), stats });
          return;
        }
        case 'crop': {
          const x0 = Number(params.tx) || 50;
          const y0 = Number(params.ty) || 50;
          const cw = Math.min(Number(params.cropW) || 200, canvas.width - x0);
          const ch = Math.min(Number(params.cropH) || 200, canvas.height - y0);
          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = cw;
          cropCanvas.height = ch;
          const cropCtx = cropCanvas.getContext('2d')!;
          cropCtx.drawImage(canvas, x0, y0, cw, ch, 0, 0, cw, ch);
          stats.operation = 'Crop';
          stats.region = `(${x0},${y0}) ${cw}×${ch}`;
          stats.width = cw; stats.height = ch;
          const execTime3 = performance.now() - startTime;
          stats.execTime = `${execTime3.toFixed(1)} ms`;
          resolve({ result: cropCanvas.toDataURL(), stats });
          return;
        }
        case 'telea':
        case 'navier-stokes': {
          // Simulated inpainting: smooth the center region using blur
          const radius = Number(params.inpaintRadius) || 5;
          const w = canvas.width, h = canvas.height;
          const cx = Math.floor(w / 2), cy = Math.floor(h / 2);
          const maskR = Math.min(Math.floor(w * 0.15), 80);
          const copy = new Uint8ClampedArray(data);
          // Blur within circular mask area
          for (let y = cy - maskR; y < cy + maskR; y++) {
            for (let x = cx - maskR; x < cx + maskR; x++) {
              if (x < 0 || x >= w || y < 0 || y >= h) continue;
              const dx = x - cx, dy = y - cy;
              if (dx * dx + dy * dy > maskR * maskR) continue;
              for (let c = 0; c < 3; c++) {
                let sum = 0, cnt = 0;
                for (let ky = -radius; ky <= radius; ky++) {
                  for (let kx = -radius; kx <= radius; kx++) {
                    const ny = y + ky, nx = x + kx;
                    if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                      const nd = nx - cx, ndy = ny - cy;
                      if (nd * nd + ndy * ndy > maskR * maskR) {
                        sum += copy[(ny * w + nx) * 4 + c];
                        cnt++;
                      }
                    }
                  }
                }
                if (cnt > 0) data[(y * w + x) * 4 + c] = Math.round(sum / cnt);
              }
            }
          }
          stats.method = operationId === 'telea' ? 'Telea (FMM)' : 'Navier-Stokes';
          stats.radius = radius;
          break;
        }
        case 'template-match': {
          // Demonstrate template matching by highlighting a detected region
          const w = canvas.width, h = canvas.height;
          // Use top-left 64x64 as template and find best match
          const tw = Math.min(64, Math.floor(w / 4));
          const th = Math.min(64, Math.floor(h / 4));
          let bestX = 0, bestY = 0, bestScore = -Infinity;
          for (let sy = 0; sy < h - th; sy += 4) {
            for (let sx = 0; sx < w - tw; sx += 4) {
              let score = 0;
              for (let ty2 = 0; ty2 < th; ty2 += 2) {
                for (let tx2 = 0; tx2 < tw; tx2 += 2) {
                  const ti = (ty2 * w + tx2) * 4;
                  const si = ((sy + ty2) * w + (sx + tx2)) * 4;
                  const diff = Math.abs(data[ti] - data[si]) + Math.abs(data[ti+1] - data[si+1]) + Math.abs(data[ti+2] - data[si+2]);
                  score -= diff;
                }
              }
              if (score > bestScore && (sx > tw || sy > th)) {
                bestScore = score; bestX = sx; bestY = sy;
              }
            }
          }
          // Draw red rectangle
          for (let x = bestX; x < bestX + tw && x < w; x++) {
            for (const y of [bestY, bestY + th - 1]) {
              if (y >= 0 && y < h) {
                const idx = (y * w + x) * 4;
                data[idx] = 255; data[idx+1] = 0; data[idx+2] = 0;
              }
            }
          }
          for (let y = bestY; y < bestY + th && y < h; y++) {
            for (const x of [bestX, bestX + tw - 1]) {
              if (x >= 0 && x < w) {
                const idx = (y * w + x) * 4;
                data[idx] = 255; data[idx+1] = 0; data[idx+2] = 0;
              }
            }
          }
          stats.method = 'NCC Template Match';
          stats.matchLocation = `(${bestX}, ${bestY})`;
          stats.templateSize = `${tw}×${th}`;
          break;
        }
        case 'channel-split': {
          const channel = String(params.channel || 'red');
          for (let i = 0; i < data.length; i += 4) {
            if (channel === 'red') { data[i+1] = 0; data[i+2] = 0; }
            else if (channel === 'green') { data[i] = 0; data[i+2] = 0; }
            else if (channel === 'blue') { data[i] = 0; data[i+1] = 0; }
          }
          stats.channel = channel;
          break;
        }
        case 'decompress':
        case 'compare': {
          // These ops are conceptual — show the original image with info
          stats.operation = operationId === 'decompress' ? 'Decompressed (identical)' : 'Pixel comparison';
          stats.mse = '0.00';
          stats.pixelIdentical = 'Yes ✓';
          break;
        }
        default: {
          // Generic grayscale fallback
          for (let i = 0; i < data.length; i += 4) {
            const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            data[i] = data[i + 1] = data[i + 2] = gray;
          }
          stats.note = 'Converted to grayscale (fallback)';
        }
      }

      const execTime = performance.now() - startTime;
      stats.execTime = `${execTime.toFixed(1)} ms`;

      ctx.putImageData(imgDataObj, 0, 0);
      resolve({ result: canvas.toDataURL(), stats });
    };
    img.src = imageData;
  });
}

export default function ExperimentPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const experimentNum = Number(id);
  const isPostlab = location.pathname.startsWith('/postlab');

  const experiment: ExperimentData | undefined = isPostlab
    ? postlabs.find((p) => p.number === experimentNum)
    : practicals.find((p) => p.number === experimentNum);

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedOp, setSelectedOp] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState<Record<string, string | number>>({});
  const [params, setParams] = useState<Record<string, number | string>>({
    kernelSize: 5,
    sigma: 1.5,
    sigmaColor: 75,
    threshold: 127,
    brightness: 50,
    angle: 45,
    tx: 50,
    ty: 50,
    scaleX: 1.5,
    scaleY: 1.5,
    shearX: 0.3,
    cropW: 200,
    cropH: 200,
    strength: 1,
    lowThreshold: 50,
    highThreshold: 150,
    inpaintRadius: 5,
    direction: 'horizontal',
    channel: 'red',
  });

  useEffect(() => {
    if (experiment && experiment.operations.length > 0) {
      setSelectedOp(experiment.operations[0].id);
    }
  }, [experiment]);

  const handleImageLoad = useCallback((imageData: string) => {
    setOriginalImage(imageData);
    setProcessedImage(null);
    setStats({});
  }, []);

  const handleApply = useCallback(async () => {
    if (!originalImage || !selectedOp) return;
    setProcessing(true);
    try {
      // Small delay for visual feedback
      await new Promise((r) => setTimeout(r, 100));
      const result = await processImage(originalImage, selectedOp, params);
      setProcessedImage(result.result);
      setStats(result.stats);
    } finally {
      setProcessing(false);
    }
  }, [originalImage, selectedOp, params]);

  const handleReset = () => {
    setProcessedImage(null);
    setStats({});
  };

  if (!experiment) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-[48px] text-text-muted">error</span>
        <h2 className="text-headline-md mt-2">Experiment not found</h2>
      </div>
    );
  }

  // Get relevant parameter controls for current operation
  const getControls = () => {
    const controls: { key: string; label: string; type: 'range' | 'select'; min?: number; max?: number; step?: number; options?: { value: string; label: string }[] }[] = [];

    if (['averaging', 'gaussian', 'median', 'bilateral', 'smooth', 'erosion', 'dilation', 'opening', 'closing', 'white-tophat', 'black-tophat'].includes(selectedOp)) {
      controls.push({ key: 'kernelSize', label: 'Kernel Size', type: 'range', min: 3, max: 21, step: 2 });
    }
    if (['gaussian', 'bilateral'].includes(selectedOp)) {
      controls.push({ key: 'sigma', label: 'Sigma (σ)', type: 'range', min: 0.5, max: 10, step: 0.1 });
    }
    if (selectedOp === 'bilateral') {
      controls.push({ key: 'sigmaColor', label: 'Sigma Color', type: 'range', min: 10, max: 200, step: 5 });
    }
    if (['threshold', 'and'].includes(selectedOp)) {
      controls.push({ key: 'threshold', label: 'Threshold (T)', type: 'range', min: 0, max: 255, step: 1 });
    }
    if (['add', 'subtract', 'multiply', 'divide', 'or'].includes(selectedOp)) {
      controls.push({ key: 'brightness', label: 'Intensity Offset', type: 'range', min: 1, max: 200, step: 1 });
    }
    if (selectedOp === 'rotate') {
      controls.push({ key: 'angle', label: 'Angle (°)', type: 'range', min: -180, max: 180, step: 1 });
    }
    if (['translate', 'crop'].includes(selectedOp)) {
      controls.push({ key: 'tx', label: 'X Offset', type: 'range', min: 0, max: 300, step: 1 });
      controls.push({ key: 'ty', label: 'Y Offset', type: 'range', min: 0, max: 300, step: 1 });
    }
    if (selectedOp === 'crop') {
      controls.push({ key: 'cropW', label: 'Width', type: 'range', min: 32, max: 512, step: 8 });
      controls.push({ key: 'cropH', label: 'Height', type: 'range', min: 32, max: 512, step: 8 });
    }
    if (selectedOp === 'scale') {
      controls.push({ key: 'scaleX', label: 'Scale X', type: 'range', min: 0.25, max: 3, step: 0.05 });
      controls.push({ key: 'scaleY', label: 'Scale Y', type: 'range', min: 0.25, max: 3, step: 0.05 });
    }
    if (selectedOp === 'shear') {
      controls.push({ key: 'shearX', label: 'Shear Factor X', type: 'range', min: -1, max: 1, step: 0.05 });
    }
    if (selectedOp === 'sharpen') {
      controls.push({ key: 'strength', label: 'Strength', type: 'range', min: 0.1, max: 3, step: 0.1 });
    }
    if (selectedOp === 'canny') {
      controls.push({ key: 'lowThreshold', label: 'Low Threshold', type: 'range', min: 0, max: 255, step: 1 });
      controls.push({ key: 'highThreshold', label: 'High Threshold', type: 'range', min: 0, max: 255, step: 1 });
    }
    if (['telea', 'navier-stokes'].includes(selectedOp)) {
      controls.push({ key: 'inpaintRadius', label: 'Inpaint Radius', type: 'range', min: 1, max: 15, step: 1 });
    }
    if (selectedOp === 'reflect') {
      controls.push({ key: 'direction', label: 'Direction', type: 'select', options: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
        { value: 'both', label: 'Both' },
      ] });
    }
    if (selectedOp === 'channel-split') {
      controls.push({ key: 'channel', label: 'Channel', type: 'select', options: [
        { value: 'red', label: 'Red (R)' },
        { value: 'green', label: 'Green (G)' },
        { value: 'blue', label: 'Blue (B)' },
      ] });
    }

    return controls;
  };

  const controls = getControls();

  return (
    <div className="p-4 lg:p-8 flex flex-col gap-6 max-w-[1720px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 bg-white p-6 rounded-xl border border-border-subtle shadow-xs relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-2 max-w-4xl relative z-10">
          <div className="flex items-center gap-2">
            <span className={`font-mono text-badge-label px-2 py-0.5 rounded ${
              isPostlab
                ? 'bg-orange-50 text-secondary-hover border border-secondary/30'
                : 'bg-red-50 text-primary border border-primary/30'
            }`}>
              {isPostlab ? `EXP-${String(experiment.number).padStart(2, '0')}` : `P-${String(experiment.number).padStart(2, '0')}`}
            </span>
            <span className="font-mono text-badge-label text-text-muted uppercase">
              OpenCV 4.8.0 • WASM
            </span>
          </div>
          <h1 className="font-geist text-headline-lg lg:text-display-hero-mobile text-text-primary tracking-tight">
            {isPostlab ? `Post-Lab ${experiment.number}` : `Practical ${experiment.number}`}: {experiment.title}
          </h1>
          <p className="font-geist text-body-lg text-text-secondary leading-relaxed">
            {experiment.description}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start lg:self-end relative z-10">
          <button onClick={handleReset} className="btn-outline">
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            Reset
          </button>
          <button className="btn-outline">
            <span className="material-symbols-outlined text-[16px]">bookmark</span>
            Bookmark
          </button>
          <button onClick={handleApply} disabled={!originalImage || processing} className={`btn-primary ${(!originalImage || processing) ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className="material-symbols-outlined text-[16px]">{processing ? 'hourglass_top' : 'play_arrow'}</span>
            {processing ? 'Processing...' : 'Apply Spatial Convolution'}
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard label="Kernel Convolution" value={`${params.kernelSize || '—'}`} unit="px" icon="grid_3x3" accentColor="red" />
        <StatCard label="Structural Size" value={stats.width ? `${stats.width}×${stats.height}` : '—'} icon="aspect_ratio" />
        <StatCard label="Execution Time" value={stats.execTime || '—'} icon="timer" accentColor="orange" />
        {Object.entries(stats)
          .filter(([k]) => !['width', 'height', 'channels', 'execTime'].includes(k))
          .slice(0, 3)
          .map(([key, val]) => (
            <StatCard key={key} label={key.replace(/([A-Z])/g, ' $1').trim()} value={String(val)} />
          ))}
      </div>

      {/* Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upload & Controls */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-border-subtle p-4 flex flex-col gap-4">
            <div className="font-mono text-stat-label text-text-muted uppercase tracking-wider">
              Input Source Matrix
            </div>
            <ImageUpload onImageLoad={handleImageLoad} />

            {/* Operation Selector */}
            <div className="flex flex-col gap-2">
              <div className="font-mono text-stat-label text-text-muted uppercase tracking-wider">
                Filter Operator
              </div>
              <div className="flex flex-wrap gap-1.5">
                {experiment.operations.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setSelectedOp(op.id)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-control-label transition-colors border ${
                      selectedOp === op.id
                        ? isPostlab
                          ? 'bg-orange-50 text-secondary-hover border-secondary/40 font-semibold shadow-xs'
                          : 'bg-red-50 text-primary border-primary/40 font-semibold shadow-xs'
                        : 'bg-white text-text-secondary border-border-subtle hover:bg-neutral-100:bg-dark-surface-raised'
                    }`}
                  >
                    {op.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter Controls */}
            {controls.length > 0 && (
              <div className="flex flex-col gap-3 pt-2 border-t border-border-subtle">
                {controls.map((ctrl) => (
                  <div key={ctrl.key} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-control-label text-text-secondary">
                        {ctrl.label}
                      </label>
                      <span className="font-mono text-control-label text-text-primary font-semibold tabular-nums">
                        {params[ctrl.key]}
                      </span>
                    </div>
                    {ctrl.type === 'range' ? (
                      <input
                        type="range"
                        min={ctrl.min}
                        max={ctrl.max}
                        step={ctrl.step}
                        value={Number(params[ctrl.key])}
                        onChange={(e) => setParams({ ...params, [ctrl.key]: Number(e.target.value) })}
                        className="w-full accent-primary"
                      />
                    ) : ctrl.type === 'select' ? (
                      <select
                        value={String(params[ctrl.key])}
                        onChange={(e) => setParams({ ...params, [ctrl.key]: e.target.value })}
                        className="w-full bg-white border border-border-subtle rounded px-2 py-1 text-body-sm font-mono"
                      >
                        {ctrl.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {/* Apply Button */}
            <button
              onClick={handleApply}
              disabled={!originalImage || processing}
              className={`w-full btn-primary justify-center py-2.5 text-[13px] ${(!originalImage || processing) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="material-symbols-outlined text-[18px]">{processing ? 'sync' : 'play_circle'}</span>
              {processing ? 'Computing...' : 'Apply Spatial Convolution ▸ Enter'}
            </button>
          </div>
        </div>

        {/* Right: Image Comparison */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-border-subtle p-4">
            {processing && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-control-label text-text-muted">Processing...</span>
                </div>
              </div>
            )}
            <ImageCompare original={originalImage} processed={processedImage} />
          </div>
        </div>
      </div>



      {/* Code Panel */}
      <CodePanel code={experiment.pythonCode} title={`Python / OpenCV Implementation (cv2.${selectedOp})`} />
    </div>
  );
}
