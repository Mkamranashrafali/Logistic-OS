import os
import glob

router_dir = r"backend\app\api\routers"
files = glob.glob(os.path.join(router_dir, "*.py"))

for file in files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Safely replace only the exact match
    content = content.replace('@router.get("/")', '@router.get("")')
    content = content.replace('@router.post("/")', '@router.post("")')
    content = content.replace('@router.put("/")', '@router.put("")')
    content = content.replace('@router.delete("/")', '@router.delete("")')
    content = content.replace('@router.patch("/")', '@router.patch("")')
    
    content = content.replace('@router.get("/",', '@router.get("",')
    content = content.replace('@router.post("/",', '@router.post("",')
    content = content.replace('@router.put("/",', '@router.put("",')
    content = content.replace('@router.delete("/",', '@router.delete("",')
    content = content.replace('@router.patch("/",', '@router.patch("",')

    with open(file, "w", encoding="utf-8") as f:
        f.write(content)
