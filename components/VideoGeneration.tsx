import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { VideoGenerationJob } from '../types';
import { startVideoGeneration, checkVideoGenerationStatus, API_KEY } from '../services/geminiService';

const POLLING_INTERVAL = 10000; // 10 seconds, as recommended

const REASSURING_MESSAGES = [
    "Initializing video generation...",
    "Analyzing prompt and image context...",
    "Allocating dedicated generation resources...",
    "Composing initial video frames...",
    "Rendering high-definition scenes...",
    "Performing quality checks on generated video...",
    "Finalizing video output, almost there!",
];

interface VideoGenerationProps {
    jobs: VideoGenerationJob[];
    onAddJob: (job: VideoGenerationJob) => void;
    onUpdateJob: (job: VideoGenerationJob) => void;
}

const VideoGeneration: React.FC<VideoGenerationProps> = ({ jobs, onAddJob, onUpdateJob }) => {
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    
    // Polling logic
    useEffect(() => {
        const activeJobs = jobs.filter(j => j.status === 'Queued' || j.status === 'Processing');
        if (activeJobs.length === 0) return;

        const interval = setInterval(() => {
            activeJobs.forEach(async (job) => {
                try {
                    if (!job.operation) return;
                    
                    const updatedOperation = await checkVideoGenerationStatus(job.operation);

                    if (updatedOperation.done) {
                        const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
                        if (!downloadLink) throw new Error("Video URI not found in operation response.");
                        
                        const response = await fetch(`${downloadLink}&key=${API_KEY || ''}`);
                        if (!response.ok) throw new Error(`Failed to fetch video: ${response.statusText}`);
                        
                        const blob = await response.blob();
                        const videoUrl = URL.createObjectURL(blob);
                        
                        onUpdateJob({ ...job, status: 'Completed', videoUrl, operation: undefined, progressMessage: 'Video generation complete.' });
                    } else {
                         const randomMessage = REASSURING_MESSAGES[Math.floor(Math.random() * REASSURING_MESSAGES.length)];
                         onUpdateJob({ ...job, status: 'Processing', progressMessage: randomMessage, operation: updatedOperation });
                    }
                } catch (err) {
                    console.error("Polling failed for job", job.id, err);
                    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during generation.';
                    onUpdateJob({ ...job, status: 'Failed', progressMessage: errorMessage, operation: undefined });
                }
            });
        }, POLLING_INTERVAL);

        return () => clearInterval(interval);
    }, [jobs, onUpdateJob]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit for inline data
                setError('Image size should not exceed 4MB.');
                return;
            }
            setError('');
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async () => {
        if (!prompt.trim()) {
            setError("A descriptive prompt is required.");
            return;
        }
        setIsGenerating(true);
        setError('');

        try {
            let imagePayload;
            if (imageFile) {
                const base64 = await fileToBase64(imageFile);
                imagePayload = { base64, mimeType: imageFile.type };
            }

            const operation = await startVideoGeneration(prompt, imagePayload);
            
            const newJob: VideoGenerationJob = {
                id: operation.name,
                prompt,
                status: 'Queued',
                inputImageUrl: imagePreview || undefined,
                creationTime: new Date().toISOString(),
                operation,
                progressMessage: "Job submitted successfully, waiting for processing to start."
            };
            onAddJob(newJob);
            setPrompt('');
            setImageFile(null);
            setImagePreview(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start video generation.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">AI Video Generation</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md space-y-4 dark:bg-slate-800 dark:border dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-dark-text dark:text-slate-200">Create a New Video</h3>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Prompt</label>
                        <textarea rows={5} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g., A short, informative video about handwashing techniques for patient education." className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Optional Starting Image</label>
                         <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-dark/10 file:text-primary-dark hover:file:bg-primary-dark/20 dark:file:bg-primary/20 dark:file:text-primary"/>
                    </div>
                    {imagePreview && (
                        <div className="relative">
                            <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-lg" />
                            <button onClick={() => {setImageFile(null); setImagePreview(null);}} className="absolute top-2 right-2 bg-black/50 text-white rounded-full h-6 w-6 flex items-center justify-center text-lg leading-none hover:bg-black/75">&times;</button>
                        </div>
                    )}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button onClick={handleSubmit} disabled={isGenerating} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:bg-gray-400 flex items-center justify-center">
                        {isGenerating ? 'Submitting...' : 'Generate Video'}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-dark-text mb-4 dark:text-slate-200">Generation Jobs</h3>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {jobs.length === 0 ? (
                            <p className="text-center text-light-text dark:text-slate-400 py-8">No video generation jobs yet.</p>
                        ) : (
                            jobs.map(job => (
                            <div key={job.id} className="bg-light-bg p-4 rounded-lg dark:bg-slate-700/50 flex gap-4">
                                {job.inputImageUrl && <img src={job.inputImageUrl} alt="Input" className="w-24 h-24 object-cover rounded-md flex-shrink-0" />}
                                <div className="flex-grow">
                                    <p className="text-sm font-semibold text-dark-text dark:text-slate-200">{job.prompt}</p>
                                    <p className="text-xs text-light-text dark:text-slate-400">Created: {new Date(job.creationTime).toLocaleString()}</p>
                                    <div className="mt-2">
                                        {job.status === 'Completed' && job.videoUrl && (
                                            <div>
                                                <video src={job.videoUrl} controls className="w-full rounded-lg" />
                                                <a href={job.videoUrl} download={`video_${job.id.slice(-6)}.mp4`} className="mt-2 inline-block bg-success text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700">Download Video</a>
                                            </div>
                                        )}
                                        {(job.status === 'Processing' || job.status === 'Queued') && (
                                            <div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600 overflow-hidden">
                                                    <div className="bg-primary h-2.5 rounded-full animate-progress-bar"></div>
                                                </div>
                                                <p className="text-xs text-light-text dark:text-slate-400 mt-1 italic">{job.progressMessage}</p>
                                            </div>
                                        )}
                                        {job.status === 'Failed' && <p className="text-sm text-red-600 font-semibold">{job.progressMessage || 'Job failed.'}</p>}
                                    </div>
                                </div>
                            </div>
                        )))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoGeneration;