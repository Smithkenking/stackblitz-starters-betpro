/// <reference lib="webworker" />


addEventListener('message', ({ data }) => {
    setTimeout(() => {
        postMessage(data);
    }, 5000);
  
});
