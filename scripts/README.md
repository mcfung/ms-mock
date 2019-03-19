# Release Process

The Release process is **_full manual_** operation.
Please follow the steps below:

### Pre-Release (alpha, beta, next)
1. Update version in all package.json in `packages` folder and commit it. The version should be in format \<major\>.\<minor\>.\<patch\>-\<alpha/beta/next\>.\<sequence number\>
2. Go to the Project Root, run `yarn build`
3. Go to the Project Root, run `yarn version` and input the same version
4. Go to each package in packages, run `yarn publish --tag \<alpha/beta/next\> --new-version \<version input in previous step\>`

### Release
1. Update version in all package.json in `packages` folder and commit it. The version should be in format \<major\>.\<minor\>.\<patch\>
2. Go to the Project Root, run `yarn build`
3. Go to the Project Root, run `yarn version` and input the same version
4. Go to each package in packages, run `yarn publish --new-version \<version input in previous step\>`