#!/usr/bin/env python3
"""
Performance monitoring script for the weapon detection system
Run this alongside the backend to monitor resource usage
"""

import psutil
import time
import sys

def monitor_performance(duration=60, interval=5):
    """Monitor CPU, memory, and network for specified duration"""
    print("=" * 60)
    print("PERFORMANCE MONITOR")
    print("=" * 60)
    print(f"Monitoring for {duration} seconds (interval: {interval}s)")
    print("=" * 60)
    print(f"{'Time':<10} {'CPU %':<10} {'RAM %':<10} {'RAM MB':<12} {'Net Sent':<15} {'Net Recv':<15}")
    print("-" * 60)
    
    start_time = time.time()
    net_start = psutil.net_io_counters()
    
    try:
        while time.time() - start_time < duration:
            # Get system stats
            cpu_percent = psutil.cpu_percent(interval=1)
            mem = psutil.virtual_memory()
            net = psutil.net_io_counters()
            
            # Calculate network throughput
            net_sent_mb = (net.bytes_sent - net_start.bytes_sent) / (1024 * 1024)
            net_recv_mb = (net.bytes_recv - net_start.bytes_recv) / (1024 * 1024)
            
            elapsed = int(time.time() - start_time)
            
            print(f"{elapsed:<10} {cpu_percent:<10.1f} {mem.percent:<10.1f} "
                  f"{mem.used/(1024**3):<12.2f} {net_sent_mb:<15.2f} {net_recv_mb:<15.2f}")
            
            time.sleep(interval - 1)  # -1 because cpu_percent takes 1 second
            
    except KeyboardInterrupt:
        print("\nMonitoring stopped")
    
    print("-" * 60)
    print("Monitoring complete")

if __name__ == "__main__":
    duration = 300  # 5 minutes default
    if len(sys.argv) > 1:
        duration = int(sys.argv[1])
    
    monitor_performance(duration=duration, interval=5)
