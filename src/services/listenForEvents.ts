import { ethers } from 'ethers';
import Web3 from 'web3';

import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class ContinuousService implements OnModuleInit {
  onModuleInit() {
    this.runContinuousTask();
  }


  
  private runContinuousTask() {
    console.log('Task running...');

    // Your continuous task logic here
  }
}
