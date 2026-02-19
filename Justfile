default: check

fmt:
    deno fmt

lint:
    deno lint

fix:
    deno lint --fix
    deno fmt

check: fmt lint 

ready: fix 
    @echo "All good! Ready to 'jj squash' or 'jj new'."

push: check
    jj git push
