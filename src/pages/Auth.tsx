<template>
  <div class="flex h-screen">
    <div class="w-1/2 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">  
      <h1 class="text-white text-4xl font-bold">Brand Name</h1>
    </div>
    <div class="w-1/2 flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 class="text-2xl font-semibold mb-4">Authentication</h2>
        <div class="flex space-x-4 mb-4">
          <div class="card role-card">
            <LucideIcon name="Icon1" />
            <span>Role 1</span>
          </div>
          <div class="card role-card">
            <LucideIcon name="Icon2" />
            <span>Role 2</span>
          </div>
        </div>
        <input placeholder="Email" class="h-12 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all p-2 mb-4 w-full" />
        <input placeholder="Password" class="h-12 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all p-2 mb-4 w-full" />
        <button class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg h-12 hover:scale-105 transition-all">Submit</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import any necessary icons from lucide-react
import { Icon1, Icon2 } from 'lucide-react';
</script>
<style>
.card {
  cursor: pointer;
  transition: transform 0.3s;
}

.card:hover {
  transform: scale(1.05);
}
</style>
